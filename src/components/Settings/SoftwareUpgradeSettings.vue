<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>upgrade</v-icon>
      </v-avatar>
      <v-toolbar-title>Software Upgrade</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Current versions in use:</v-list-item-title>
            <v-list-item-action-text>
              <strong>Your server's version is: {{ serverVersion }}</strong>
              <br />
              <strong>Your client's version is: {{ version }}</strong>
              <br />
              <strong v-if="monsterPiVersion">
                Your MonsterPi version is: {{ monsterPiVersion }}<br />
              </strong>
              <strong v-else> No MonsterPi distro was detected. </strong>
            </v-list-item-action-text>
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
            <a href="https://docs.fdm-monster.net">docs.fdm-monster.net</a>
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
            Upgrade the client webapp for quickly retrieving small fixes and features
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title> Select a release to upgrade to:</v-list-item-title>
          <v-list-item-subtitle>
            Minimum required version: {{ minimum?.tag_name }}</v-list-item-subtitle
          >

          <span v-if="loading"> <v-alert>Loading releases...</v-alert></span>
          <v-alert v-if="!loading && !filteredReleases?.length">No releases to show.</v-alert>
          <v-radio-group v-model="selectedRelease">
            <v-radio
              v-for="release in filteredReleases"
              :key="release.tag_name"
              :disabled="
                isCurrentRelease(release) ||
                !isUpgradeOrAllowedDowngrade(release, current) ||
                isBelowMinimum(release)
              "
              :label="`${release.tag_name}${
                !isUpgradeOrAllowedDowngrade(release, current)
                  ? ' (cannot downgrade, '
                  : ' (' || (isCurrentRelease(release) ? ' (current, ' : '(')
              }${
                isVersionUnstable(release)
                  ? `${isBelowMinimum(release) ? 'below minimum' : 'unstable'})`
                  : ')'
              }`"
              :value="release.tag_name"
            >
            </v-radio>
          </v-radio-group>
          <div>
            <v-alert v-if="showPrereleases" color="primary" max-width="500px">
              You are viewing prereleases, please install such versions at your own risk!
            </v-alert>
          </div>
          <div>
            <v-checkbox v-model="allowDowngrade" label="Allow downgrade"></v-checkbox>
            <v-checkbox
              :disabled="getIsCurrentUnstable"
              v-model="showPrereleases"
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
            :disabled="!selectedRelease?.length || selectedRelease === current?.tag_name"
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

const loading = ref(true);
const allowDowngrade = ref(false);
const serverVersion = ref("");
const monsterPiVersion = ref<string | null>("");
const version = ref(packageJsonVersion);
const current = ref<IRelease>();
const minimum = ref<IRelease>();
const selectedRelease = ref<string>();
const showPrereleases = ref<boolean>(false);
const loadedClientReleases = ref<IRelease[]>([]);

onMounted(async () => {
  await loadReleases();

  const versionSpec = await AppService.getVersion();
  serverVersion.value = versionSpec.version;
  monsterPiVersion.value = versionSpec.monsterPi;
});

async function loadReleases() {
  loading.value = true;
  const clientReleases = await AppService.getClientReleases();
  current.value = clientReleases.current;
  minimum.value = clientReleases.minimum;
  loadedClientReleases.value = clientReleases.releases;
  loading.value = false;
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
    compare(minimum.value!.tag_name, current.tag_name) !== -1
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
