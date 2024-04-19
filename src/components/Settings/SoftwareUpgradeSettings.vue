<template>
  <v-card>
    <SettingsToolbar icon="upgrade" title="Software Upgrade" />

    <v-list subheader three-line>
      <v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Current versions in use:</v-list-item-title>
            <v-list-item-subtitle>
              Your server's version is: {{ serverVersion }}
            </v-list-item-subtitle>
            <v-list-item-subtitle> Your client's version is: {{ version }} </v-list-item-subtitle>
            <v-list-item-subtitle>
              <div v-if="monsterPiVersion">
                MonsterPi:
                <div>Your MonsterPi version is:</div>
                {{ monsterPiVersion }}<br />
              </div>
              <div v-else>
                MonsterPi:
                <div>No MonsterPi distro was detected.</div>
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-content>
    </v-list>
    <v-divider />
    <v-list subheader three-line>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Server upgrade</v-list-item-title>
          <v-list-item-subtitle>
            Please visit
            <a href="https://docs.fdm-monster.net/docs/installing/">
              the installation documentation
            </a>
            for instructions on how to upgrade the server.
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list subheader three-line>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Client upgrade</v-list-item-title>
          <v-list-item-subtitle>
            Please visit
            <a href="https://docs.fdm-monster.net/docs/configuration/updating_client_bundle">
              the installation documentation
            </a>
            for instructions on how to upgrade the client bundle.
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Upgrade the client webapp for quickly retrieving small fixes and features
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title v-if="!rateLimitExceeded">
            Select a release to upgrade to:</v-list-item-title
          >
          <v-list-item-subtitle class="mt-2" v-if="!rateLimitExceeded">
            Minimum required version: {{ minimum?.tag_name }}
          </v-list-item-subtitle>

          <v-alert color="error" v-if="errorMessage" style="color: black" class="mt-4 mb-6">
            {{ errorMessage }}
          </v-alert>
          <span v-else-if="loading"> <v-alert>Loading releases...</v-alert></span>
          <v-alert v-if="!rateLimitExceeded && !loading && !filteredReleases?.length"
            >No releases to show.</v-alert
          >
          <v-radio-group v-model="selectedRelease" v-if="filteredReleases?.length">
            <v-radio
              v-for="release in filteredReleases"
              :key="release.tag_name"
              :disabled="isDisabledRelease(release)"
              :label="calculateLabelDisabledReason(release)"
              :value="release.tag_name"
            />
          </v-radio-group>
          <div>
            <v-alert v-if="showPrereleases" color="primary" max-width="500px">
              You are viewing prereleases, please install such versions at your own risk!
            </v-alert>
          </div>
          <div>
            <v-checkbox
              :disabled="rateLimitExceeded"
              v-model="allowDowngrade"
              class="mt-0"
              label="Allow downgrade"
            ></v-checkbox>
            <v-checkbox
              class="mt-0"
              v-model="showPrereleases"
              :disabled="getIsCurrentUnstable || rateLimitExceeded"
              :label="
                getIsCurrentUnstable
                  ? 'Show prerelease versions (Currently already on prerelease version)'
                  : 'Show prerelease versions'
              "
            ></v-checkbox>
          </div>
          <v-btn class="mt-2 mr-4" color="secondary" @click="loadReleases()">
            Reload release version list
          </v-btn>
          <v-btn
            :disabled="
              !selectedRelease?.length || selectedRelease === current?.tag_name || rateLimitExceeded
            "
            class="mt-2"
            color="primary"
            variant="flat"
            @click="clickUpdateClient(selectedRelease)"
          >
            <v-icon>upgrade</v-icon>
            Upgrade/downgrade client
          </v-btn>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts" setup>
import { AppService } from "@/backend/app.service";
import { computed, onMounted, ref } from "vue";
import { version as packageJsonVersion } from "../../../package.json";
import { IRelease } from "@/models/server/client-releases.model";
import { compare, minor } from "semver";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { useFeatureStore } from "@/store/features.store";

const errorMessage = ref("");
const loading = ref(true);
const rateLimitExceeded = ref(false);
const allowDowngrade = ref(false);
const serverVersion = ref("");
const monsterPiVersion = ref<string | null>("");
const version = ref(packageJsonVersion);
const current = ref<IRelease>();
const minimum = ref<IRelease>();
const selectedRelease = ref<string>();
const showPrereleases = ref<boolean>(false);
const loadedClientReleases = ref<IRelease[]>([]);
const featureStore = useFeatureStore();

onMounted(async () => {
  await loadReleases();

  const versionSpec = await AppService.getVersion();
  serverVersion.value = versionSpec.version;
  monsterPiVersion.value = versionSpec.monsterPi;
});

async function loadReleases() {
  loading.value = true;
  errorMessage.value = "";
  rateLimitExceeded.value = false;

  if (featureStore.hasFeature("githubRateLimitApi")) {
    try {
      const rateLimit = await AppService.getGithubRateLimit();
      if (rateLimit.rate.remaining === 0) {
        const limitResetAt = new Date(rateLimit.rate.reset);
        const time = limitResetAt.toLocaleTimeString();
        const diff = rateLimit.rate.reset * 1000 - Date.now();
        const diffMinutes = Math.ceil(diff / 60000);
        errorMessage.value = `Server has reached a rate limit of the Github API. This limit will be reset at ${time} (in ${diffMinutes} minutes)`;
        loading.value = false;
        rateLimitExceeded.value = true;
        return;
      }
    } catch (e) {
      loading.value = false;
      return;
    }
  }

  try {
    const clientReleases = await AppService.getClientReleases();
    current.value = clientReleases.current;
    minimum.value = clientReleases.minimum;
    loadedClientReleases.value = clientReleases.releases;
  } catch (e) {
    errorMessage.value = "An error occurred loading the releases: " + e.message;
  } finally {
    loading.value = false;
  }
}

const filteredReleases = computed(() => {
  return loadedClientReleases.value.filter((release) => {
    const isMinimumVersionOrHigher = minor(release.tag_name) === minor(minimum.value!.tag_name);
    const isReleaseCandidate = isVersionUnstable(release);
    const isDraft = release.draft;

    return (
      isMinimumVersionOrHigher &&
      (isCurrentUnstable() || showPrereleases.value || !isReleaseCandidate) &&
      !isDraft
    );
  });
});

const getIsCurrentUnstable = computed(() => {
  return isCurrentUnstable();
});

function isCurrentUnstable() {
  // Determine if current is rc/unstable, meaning we should ignore prerelease filter checkbox
  const currentRelease = current.value;
  return isVersionUnstable(currentRelease);
}

function isDisabledRelease(release: IRelease) {
  return (
    isCurrentRelease(release) ||
    !isUpgradeOrAllowedDowngrade(release, current.value) ||
    isBelowMinimum(release)
  );
}

function calculateLabelDisabledReason(release: IRelease) {
  const prefix = isVersionUnstable(release) ? `${release.tag_name}, unstable` : release.tag_name;

  if (isCurrentRelease(release)) {
    return `${prefix}, currently installed`;
  }
  if (isBelowMinimum(release)) {
    return `${prefix}, below minimum`;
  }
  if (!isUpgradeOrAllowedDowngrade(release, current.value)) {
    return `${prefix}, downgrade not allowed`;
  }

  return prefix;
}

function isVersionUnstable(release?: IRelease) {
  if (release?.tag_name?.length) {
    return (
      release.prerelease || release.tag_name.includes("rc") || release.tag_name.includes("unstable")
    );
  }
  return false;
}

function isBelowMinimum(release: IRelease) {
  return compare(release.tag_name, minimum.value!.tag_name) === -1;
}

function isUpgradeOrAllowedDowngrade(release: IRelease, current?: IRelease) {
  // If no current release is known, we need to throw
  if (!current) {
    throw new Error("No current release is known, cannot compare.");
  }
  if (allowDowngrade.value) {
    return true;
  }

  return (
    compare(release.tag_name, current.tag_name) !== -1 &&
    compare(release.tag_name, minimum.value!.tag_name) !== -1
  );
}

function isCurrentRelease(release: IRelease) {
  return release.tag_name === current.value?.tag_name;
}

async function clickUpdateClient(version?: string) {
  if (!confirm("Are you sure? This might cause breaking changes, if the server is outdated")) {
    return;
  }

  await AppService.updateClientDistGithub(version, allowDowngrade.value);
  location.reload();
}
</script>
