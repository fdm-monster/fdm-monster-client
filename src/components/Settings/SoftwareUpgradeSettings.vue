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
            <v-list-item-title> Current versions:</v-list-item-title>
            <v-list-item-action-text>
              <strong>Your server's version is: {{ serverVersion }}</strong>
              <br />
              <strong>Your clients's version is: {{ version }}</strong>
              <br />
              <strong v-if="monsterPiVersion">
                Your MonsterPi version is: {{ monsterPiVersion }}<br />
              </strong>
              <strong v-else> No MonsterPi distro detected. </strong>
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
          <v-list-item-action>
            <v-radio-group v-model="selectedRelease">
              <v-radio
                v-for="release in releases"
                :key="release.tag_name"
                :disabled="isCurrentRelease(release) || isDowngrade(release, current)"
                :label="`${release.tag_name}${
                  isDowngrade(release, current)
                    ? ' (cannot downgrade)'
                    : '' || (isCurrentRelease(release) ? ' (current)' : '')
                }`"
                :value="release.tag_name"
              ></v-radio>
            </v-radio-group>
          </v-list-item-action>
          <v-btn
            :disabled="!selectedRelease?.length || selectedRelease === current?.tag_name"
            class="mt-2"
            color="primary"
            variant="flat"
            @click="clickUpdateClient(selectedRelease)"
          >
            <v-icon>upgrade</v-icon>
            Upgrade client
          </v-btn>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts" setup>
import { AppService } from "@/backend/app.service";
import { onMounted, ref } from "vue";
import { version as packageJsonVersion } from "../../../package.json";
import { IRelease } from "@/models/server/client-releases.model";
import { compare, minor } from "semver";

const serverVersion = ref("");
const monsterPiVersion = ref<string | null>("");
const version = ref(packageJsonVersion);
const releases = ref<IRelease[]>([]);
const current = ref<IRelease>();
const minimum = ref<IRelease>();
const selectedRelease = ref<string>();

onMounted(async () => {
  const clientReleases = await AppService.getClientReleases();
  current.value = clientReleases.current;
  minimum.value = clientReleases.minimum;
  releases.value = clientReleases.filter((release) => {
    const isMinimumVersion = minor(release.tag_name) === minor(minimum.value.tag_name);
    const isReleaseCandidate = release.prerelease && release.tag_name.includes('rc');
    const isUnstable = release.draft || release.prerelease;
    return isMinimumVersion && !isReleaseCandidate && !isUnstable;
  });
  const versionSpec = await AppService.getVersion();
  serverVersion.value = versionSpec.version;
  monsterPiVersion.value = versionSpec.monsterPi;
});

function isCurrentRelease(release: IRelease) {
  return release.tag_name === this.current?.tag_name;
}

function isDowngrade(release: IRelease, current?: IRelease) {
  // If no current release is known, we need to throw
  if (!current) {
    throw new Error("No current release is known, cannot compare.");
  }
  return compare(release.tag_name, current.tag_name) === -1;
}

async function clickUpdateClient(tagName: string) {
  if (!confirm("Are you sure? This might cause breaking changes, if the server is outdated")) {
    return;
  }

  await AppService.updateClientDistGithub(tagName);
  location.reload();
}
</script>
