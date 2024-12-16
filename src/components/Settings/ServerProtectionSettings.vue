<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <v-card-text>
      <SettingSection title="Login and registration" :usecols="false">
        <v-row>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-checkbox v-model="loginRequired" label="Require Login" @change="setLoginRequired" />
          </v-col>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-checkbox
              v-model="registrationEnabled"
              label="Enable Registration"
              @change="setRegistrationEnabled"
            />
          </v-col>
        </v-row>
      </SettingSection>

      <v-divider />

      <SettingSection title="Login expiry settings (advanced)" :usecols="false">
        <v-alert color="secondary" class="mb-6">
          <v-icon>info</v-icon> &nbsp; Be cautious, setting the wrong expiry could make you lose
          access to the server!
        </v-alert>

        <v-row>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-text-field
              v-model="jwtExpiresIn"
              :rules="[(val) => !!val && val >= 120 && val <= 120 * 60]"
              label="JWT Expiry (seconds)"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-checkbox
              v-model="refreshTokenAttemptsEnabled"
              @change="onRefreshTokenEnabledChange()"
              label="Enable Refresh Token Attempts"
            ></v-checkbox>
          </v-col>

          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-text-field
              type="number"
              v-model="refreshTokenAttempts"
              :disabled="!refreshTokenAttemptsEnabled"
              :rules="[(val) => !!val && val >= 50]"
              label="Refresh Token Attempts (disabled: -1)"
            />
          </v-col>

          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-text-field
              v-model="refreshTokenExpiry"
              :rules="[(val) => !!val && val >= 1 && val <= 30]"
              label="Refresh Token Expiry (days)"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-btn color="primary" @click="saveLoginExpirySettings()">
              save login expiry settings
            </v-btn>
          </v-col>
          <v-col cols="4" sm="12" lg="3" xl="2">
            <v-btn color="default" @click="resetLoginExpirySettingsToDefault()">
              Reset to default
            </v-btn>
          </v-col>
        </v-row>
      </SettingSection>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { SettingsService } from "@/backend";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "vue-router/composables";
import { RouteNames } from "@/router/route-names";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";

const router = useRouter();
const snackbar = useSnackbar();
const authStore = useAuthStore();

const page = settingsPage["serverProtection"];

const loginRequired = ref<boolean>(false);
const registrationEnabled = ref<boolean>(false);

const jwtExpiresIn = ref<number>();
const refreshTokenAttemptsEnabled = ref<boolean>(false);
const refreshTokenAttempts = ref<number>(-1);
const refreshTokenExpiry = ref<number>(14);

async function loadSettings() {
  const settings = await SettingsService.getSettings();
  loginRequired.value = settings.server.loginRequired;
  registrationEnabled.value = settings.server.registration;

  const sensitiveSettings = await SettingsService.getSettingsSensitive();
  jwtExpiresIn.value = sensitiveSettings.credentials.jwtExpiresIn;
  refreshTokenAttemptsEnabled.value = sensitiveSettings.credentials.refreshTokenAttempts !== -1;
  refreshTokenAttempts.value = sensitiveSettings.credentials.refreshTokenAttempts;
  refreshTokenExpiry.value = sensitiveSettings.credentials.refreshTokenExpiry / 24 / 3600;
}

onMounted(async () => {
  await loadSettings();
});

function onRefreshTokenEnabledChange() {
  if (!refreshTokenAttemptsEnabled.value) {
    refreshTokenAttempts.value = -1;
  }
}

async function setLoginRequired() {
  const loginRequiredVal = loginRequired.value;
  if (!loginRequiredVal && !confirm("Disabling login will expose your server. Continue?")) {
    return;
  } else if (!confirm("You will be redirected to login when enabling login. Continue?")) {
    return;
  }

  await SettingsService.updateLoginRequiredSettings(loginRequiredVal);

  await authStore.logout(true);

  await authStore.checkAuthenticationRequirements();
  if (!loginRequiredVal) {
    await router.push({ name: RouteNames.Home });
  } else {
    await router.push({ name: RouteNames.Login });
  }
  snackbar.info("Login Required settings updated");
}

async function setRegistrationEnabled() {
  await SettingsService.updateRegistrationEnabledSettings(registrationEnabled.value);
  await authStore.checkAuthenticationRequirements();
  snackbar.info("Registration settings updated");
}

async function resetLoginExpirySettingsToDefault() {
  jwtExpiresIn.value = 60 * 60;
  refreshTokenAttemptsEnabled.value = false;
  refreshTokenAttempts.value = -1;
  refreshTokenExpiry.value = 14;
  await saveLoginExpirySettings();
  snackbar.info("Login expiry settings reset to default");
}

async function saveLoginExpirySettings() {
  if (!jwtExpiresIn.value || jwtExpiresIn.value < 120 || jwtExpiresIn.value > 120 * 60) {
    throw new Error("JWT Expiry must be between 2 and 120 minutes");
  }
  if (
    refreshTokenAttemptsEnabled.value &&
    (refreshTokenAttempts.value < 50 || refreshTokenAttempts.value > 1000)
  ) {
    throw new Error("Refresh Token Attempts must be between 50 and 1000");
  }
  if (refreshTokenExpiry.value < 1 || refreshTokenExpiry.value > 30) {
    throw new Error("Refresh Token Expiry must be between 1 and 30 days");
  }

  await SettingsService.updateCredentialSettings(
    jwtExpiresIn.value,
    refreshTokenAttempts.value,
    refreshTokenExpiry.value * 24 * 3600
  );
  snackbar.info("Login expiry settings updated");
}
</script>
