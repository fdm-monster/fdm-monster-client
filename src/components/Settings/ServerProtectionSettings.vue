<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Server Protection Settings</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-list-item v-if="!whitelistSettingsHidden()">
        <v-list-item-content>
          <v-list-item-title>IP Whitelist</v-list-item-title>
          <v-list-item-subtitle>
            <v-alert color="primary">
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
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { whitelistSettingsHidden } from "@/shared/experimental.constants";
import { isValidIPOrMask } from "@/utils/validation.utils";
import { SettingsService } from "@/backend";

const ipAddress = ref<string>("");
const whitelistEnabled = ref<boolean>(false);
const whitelistedIpAddresses = ref<string[]>([]);

const ipAddressRule = (val: string) => (isValidIPOrMask(val) ? true : "Not a valid IP Address");

onMounted(async () => {
  const settings = await SettingsService.getSettings();
  ipAddress.value = settings.whitelistSettings.ipAddress;
  whitelistEnabled.value = settings.whitelistSettings.enabled;
  whitelistedIpAddresses.value = settings.whitelistSettings.whitelistedIpAddresses;
});

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
  await setWhitelistSettings();
}

async function setWhitelistSettings() {
  const settingsDto = await SettingsService.setWhitelistSettings({
    whitelistedIpAddresses: whitelistedIpAddresses.value,
    whitelistEnabled: whitelistEnabled.value,
  });
  whitelistedIpAddresses.value = settingsDto.server?.whitelistedIpAddresses;
  whitelistEnabled.value = settingsDto.server?.whitelistEnabled;
}
</script>
