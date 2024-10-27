<template>
  <v-card>
    <SettingsToolbar icon="security" title="Server Protection" />

    <v-list subheader three-line>
      <v-list-item v-if="!whitelistSettingsHidden">
        <v-list-item-content>
          <v-list-item-title>IP Whitelist</v-list-item-title>
          <v-list-item-subtitle>
            <v-alert color="warning">
              <v-icon>info</v-icon> &nbsp; Be cautious, setting the wrong whitelist could make you
              lose access to the server!
            </v-alert>
            Only allow access from specific IP Adresses or subnets. Note: 127.0.0.1 will always be
            allowed access. Examples:
            <br />
            <v-chip small>192.168</v-chip>
            <v-chip small>192.168.1</v-chip>
            <v-chip small>192.168.1.1</v-chip>
            <br />
            <v-row>
              <v-col cols="12" md="2">
                <v-checkbox v-model="whitelistEnabled" label="Enable IP Whitelist"></v-checkbox>
              </v-col>
            </v-row>
            <v-row class="mt-0">
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="ipAddress"
                  :disabled="!whitelistEnabled"
                  :rules="[ipAddressRule, (val) => !!val]"
                  append-icon="add"
                  label="IP Address"
                  @click:append="appendIpAddress(ipAddress)"
                >
                </v-text-field>
              </v-col>
              <v-col>
                <v-chip-group>
                  <v-chip
                    v-for="ip in whitelistedIpAddresses"
                    :key="ip"
                    :disabled="!whitelistEnabled"
                    close
                    @click:close="removeIpWhitelist(ip)"
                  >
                    {{ ip }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="default" @click="resetWhitelistSettingsToDefault()">
                  reset to default
                </v-btn>
                <v-btn color="primary" @click="setWhitelistSettings()">
                  save whitelist settings
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Login Required</v-list-item-title>

          <v-list-item-subtitle>
            <v-row>
              <v-col cols="12" md="2">
                <v-checkbox v-model="loginRequired" label="Require Login"></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="setLoginRequired()">
                  save login required setting
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Registration Enabled</v-list-item-title>
          <v-list-item-subtitle>
            <v-row>
              <v-col cols="12" md="2">
                <v-checkbox v-model="registrationEnabled" label="Enable Registration"></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn color="primary" @click="setRegistrationEnabled()">
                  save registration enabled setting
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Login Expiry Settings (advanced)</v-list-item-title>
          <v-list-item-content>
            <v-list-item-subtitle>
              <v-row>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="jwtExpiresIn"
                    :rules="[(val) => !!val && val >= 2 && val <= 120]"
                    label="JWT Expiry (minutes)"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="2">
                  <v-checkbox
                    v-model="refreshTokenAttemptsEnabled"
                    @change="onRefreshTokenEnabledChange()"
                    label="Enable Refresh Token Attempts"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="2">
                  <v-text-field
                    type="number"
                    v-model="refreshTokenAttempts"
                    :disabled="!refreshTokenAttemptsEnabled"
                    :rules="[(val) => !!val && val >= 50]"
                    label="Refresh Token Attempts (disabled: -1)"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="refreshTokenExpiry"
                    :rules="[(val) => !!val && val >= 1 && val <= 30]"
                    label="Refresh Token Expiry (days)"
                  >
                  </v-text-field>
                </v-col>
              </v-row>

              <v-alert color="secondary">
                <v-icon>info</v-icon> &nbsp; Be cautious, setting the wrong expiry could make you
                lose access to the server or make your user experience highly degraded!
              </v-alert>

              <v-row>
                <v-col>
                  <v-btn color="primary" @click="saveLoginExpirySettings()">
                    save login expiry settings
                  </v-btn>
                  <v-btn color="default" @click="resetLoginExpirySettingsToDefault()"
                    >reset to default</v-btn
                  >
                </v-col>
              </v-row>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { whitelistSettingsHidden } from "@/shared/experimental.constants";
import { isValidIPOrMask } from "@/utils/validation.utils";
import { SettingsService } from "@/backend";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "vue-router/composables";
import { RouteNames } from "@/router/route-names";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";

const router = useRouter();
const snackbar = useSnackbar();
const authStore = useAuthStore();

const ipAddress = ref<string>("");
const whitelistEnabled = ref<boolean>(false);
const whitelistedIpAddresses = ref<string[]>([]);

const loginRequired = ref<boolean>(false);
const registrationEnabled = ref<boolean>(false);

const jwtExpiresIn = ref<number>(3200);
const refreshTokenAttemptsEnabled = ref<boolean>(false);
const refreshTokenAttempts = ref<number>(-1);
const refreshTokenExpiry = ref<number>(14);

const ipAddressRule = (val: string) => (isValidIPOrMask(val) ? true : "Not a valid IP Address");

async function loadSettings() {
  const settings = await SettingsService.getSettings();
  loginRequired.value = settings.server.loginRequired;
  registrationEnabled.value = settings.server.registration;

  ipAddress.value = settings.connection?.clientIp ?? "127.0.0.1";
  whitelistEnabled.value = settings.server.whitelistEnabled;
  whitelistedIpAddresses.value = settings.server.whitelistedIpAddresses;

  const sensitiveSettings = await SettingsService.getSettingsSensitive();
  jwtExpiresIn.value = sensitiveSettings.credentials.jwtExpiresIn / 60;
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

function removeIpWhitelist(removedIp: string) {
  whitelistedIpAddresses.value = whitelistedIpAddresses.value.filter(
    (ip) => ip.toLowerCase() !== removedIp.toLowerCase()
  );
}

function appendIpAddress(ip: string) {
  if (!isValidIPOrMask(ip)) return;
  whitelistedIpAddresses.value.push(ip.toLowerCase());
}

async function resetWhitelistSettingsToDefault() {
  whitelistedIpAddresses.value = ["127.0.0.1", "::12"];
  whitelistEnabled.value = false;
  await setWhitelistSettings(false);
  snackbar.info("Whitelist settings reset to default");
}

async function setWhitelistSettings(showSuccess = true) {
  await SettingsService.setWhitelistSettings({
    whitelistedIpAddresses: whitelistedIpAddresses.value,
    whitelistEnabled: whitelistEnabled.value,
  });

  if (showSuccess) {
    snackbar.info("Whitelist settings updated");
  }
  await loadSettings();
}

async function setLoginRequired() {
  const loginRequiredVal = loginRequired.value;
  if (!loginRequiredVal && !confirm("Disabling login will expose your server. Continue?")) {
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
  jwtExpiresIn.value = 120;
  refreshTokenAttemptsEnabled.value = false;
  refreshTokenAttempts.value = -1;
  refreshTokenExpiry.value = 14;
  await saveLoginExpirySettings();
  snackbar.info("Login expiry settings reset to default");
}

async function saveLoginExpirySettings(showSnackbar = true) {
  if (jwtExpiresIn.value < 2 || jwtExpiresIn.value > 120) {
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
    jwtExpiresIn.value * 60,
    refreshTokenAttempts.value,
    refreshTokenExpiry.value * 24 * 3600
  );
  snackbar.info("Login expiry settings updated");
}
</script>
