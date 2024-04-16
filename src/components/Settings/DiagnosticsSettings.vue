<template>
  <v-card>
    <SettingsToolbar icon="bug_report" title="Diagnostics" />

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
            <v-btn color="secondary" @click="sendTestSentryException()">
              <v-icon class="pr-2">bug_report</v-icon>
              Test Error
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
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="hasLogDumpFeature">
        <v-list-item-content>
          <v-list-item-title>Clear log files</v-list-item-title>
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
import { AppService } from "@/backend/app.service";
import { useSettingsStore } from "@/store/settings.store";
import { SettingsService } from "@/backend";
import { setSentryEnabled } from "@/utils/sentry.util";
import { ServerPrivateService } from "@/backend/server-private.service";
import { useSnackbar } from "@/shared/snackbar.composable";
import { captureException } from "@sentry/vue";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";

const snackBar = useSnackbar();
const settingsStore = useSettingsStore();
const hasAnonymousDiagnosticsToggleFeature = ref(false);
const hasLogDumpFeature = ref(false);
const hasLogClearFeature = ref(false);
const sentryDiagnosticsEnabled = ref(false);
onMounted(async () => {
  const features = await AppService.getFeatures();
  hasAnonymousDiagnosticsToggleFeature.value =
    features.anonymousDiagnosticsToggle?.available || false;
  hasLogDumpFeature.value = features.logDumpZip?.available || false;
  hasLogClearFeature.value = features.clearLogFiles?.available || false;

  await settingsStore.loadSettings();
  sentryDiagnosticsEnabled.value = settingsStore.serverSettings?.sentryDiagnosticsEnabled || false;
});

async function saveSentryDiagnosticsSettings() {
  await SettingsService.setSentryDiagnosticsSettings(sentryDiagnosticsEnabled.value);
  setSentryEnabled(sentryDiagnosticsEnabled.value);
}

async function sendTestSentryException() {
  const text = `Test Error ${Date.now()} Sentry enabled: ${sentryDiagnosticsEnabled.value}`;
  try {
    throw new Error(text);
  } catch (e) {
    captureException(e);
    snackBar.openInfoMessage({
      title: "Test report was sent",
      subtitle: `Content: ${text}`,
    });
  }
}

async function downloadLogDump() {
  await ServerPrivateService.downloadLogDump();
}

async function clearOldLogFiles() {
  await ServerPrivateService.clearLogFilesOlderThanWeek();
  snackBar.openInfoMessage({
    title: "Action success",
    subtitle: "Log files older than a week have been deleted",
  });
}
</script>
