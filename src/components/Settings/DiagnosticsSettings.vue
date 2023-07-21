<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>bug_report</v-icon>
      </v-avatar>
      <v-toolbar-title>Diagnostics</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-subheader
        >Diagnostics to provide bug reports to the developers of this software
      </v-subheader>

      <v-list-item v-if="hasAnonymousDiagnosticsToggleFeature">
        <v-list-item-content>
          <v-list-item-title>Remote Sentry diagnostic reports:</v-list-item-title>
          <v-list-item-subtitle>
            <v-checkbox
              v-model="sentryDiagnosticsEnabled"
              label="Enable remote Sentry diagnostic reports"
            />
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-btn color="primary" @click="saveSentryDiagnosticsSettings()">
              <v-icon class="pr-2">save</v-icon>
              Save
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list-item v-if="hasLogDumpFeature">
        <v-list-item-content>
          <v-list-item-title>Logs Dump</v-list-item-title>
          <v-list-item-subtitle>
            Download a .zip file containing all logs from the server
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <br />
            <v-btn color="primary" @click="downloadLogDump()">
              <v-icon>download</v-icon>
              Download Log Files (.zip)
            </v-btn>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <br />
            <v-btn color="default" @click="clearOldLogFiles()">
              <v-icon>download</v-icon>
              Clear log files older than a week
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { AppService } from "../../backend/app.service";
import { useSettingsStore } from "../../store/settings.store";
import { SettingsService } from "../../backend";
import { setSentryEnabled } from "../../utils/sentry.util";
import { ServerPrivateService } from "../../backend/server-private.service";

const settingsStore = useSettingsStore();
const hasAnonymousDiagnosticsToggleFeature = ref(false);
const hasLogDumpFeature = ref(false);
const sentryDiagnosticsEnabled = ref(false);
onMounted(async () => {
  const features = await AppService.getFeatures();
  hasAnonymousDiagnosticsToggleFeature.value =
    features.anonymousDiagnosticsToggle?.available || false;
  hasLogDumpFeature.value = features.logDumpZip?.available || false;

  await settingsStore.loadSettings();
  sentryDiagnosticsEnabled.value = settingsStore.serverSettings?.sentryDiagnosticsEnabled || false;
});

async function saveSentryDiagnosticsSettings() {
  await SettingsService.setSentryDiagnosticsSettings(sentryDiagnosticsEnabled.value);
  setSentryEnabled(sentryDiagnosticsEnabled.value);
}

async function downloadLogDump() {
  await ServerPrivateService.downloadLogDump();
}

async function clearOldLogFiles() {
  await ServerPrivateService.clearLogFilesOlderThanWeek();
}
</script>
