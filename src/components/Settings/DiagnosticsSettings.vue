<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />
    <v-card-text>
      <div>
        <SettingSection
          title="Remote Sentry diagnostic reports"
          v-if="hasAnonymousDiagnosticsToggleFeature"
        >
          <v-checkbox
            @change="saveSentryDiagnosticsSettings"
            v-model="sentryDiagnosticsEnabled"
            label="Enable remote Sentry diagnostic reports"
          />

          <v-btn color="secondary" @click="sendTestSentryException()">
            <v-icon class="pr-2">bug_report</v-icon>
            Test Error
          </v-btn>
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Download a .zip file containing all logs from the server"
          v-if="hasLogDumpFeature"
          :usecols="false"
        >
          <v-row>
            <v-col cols="3">
              <v-btn color="primary" @click="downloadLogDump()">
                <v-icon>download</v-icon>
                Download Log Files (.zip)
              </v-btn>
            </v-col>
          </v-row>
        </SettingSection>

        <v-divider />
        <SettingSection title="Clear log files" v-if="hasLogClearFeature">
          <v-btn color="default" @click="clearOldLogFiles()">
            <v-icon>download</v-icon>
            Clear log files older than a week
          </v-btn>
        </SettingSection>
      </div>
    </v-card-text>
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
import { settingsPage } from "@/components/Settings/Shared/setting.constants";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";

const page = settingsPage["diagnostics"];
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
