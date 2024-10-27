<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <h2>Settings</h2>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>
                  <h3>
                    Experimental Features
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon class="help-icon" v-bind="attrs" v-on="on">help_outline</v-icon>
                      </template>
                      <span class="tooltip-content">
                        Moonraker support is currently in beta, use at your own risk.
                      </span>
                    </v-tooltip>
                  </h3>
                </v-card-title>
                <v-card-text>
                  <v-checkbox
                    v-model="experimentalMoonrakerSupport"
                    label="Enable Experimental Moonraker Support"
                    hide-details
                  >
                    <template v-slot:label>
                      <span>Enable Experimental Moonraker Support</span>
                    </template>
                  </v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>
                  <h3>
                    Database Settings
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">help_outline</v-icon>
                      </template>
                      <span class="tooltip-content">
                        By enabling this setting you will set FDM Monster to SQLite as a database
                        source (standalone mode). Please set 'ENABLE_EXPERIMENTAL_TYPEORM' to 'true'
                        to enable this feature.
                      </span>
                    </v-tooltip>
                  </h3>
                </v-card-title>
                <v-card-text>
                  <v-checkbox
                    v-model="experimentalTypeORMSupport"
                    label="Enable TypeORM Support"
                    hide-details
                    disabled
                  >
                    <template v-slot:label>
                      <span>Enable TypeORM Support</span>
                    </template>
                  </v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>
                  <h3>
                    Experimental Features
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon class="help-icon" v-bind="attrs" v-on="on">help_outline</v-icon>
                      </template>
                      <span class="tooltip-content">
                        Enables the next version of the FDM Monster UI (experimental).
                      </span>
                    </v-tooltip>
                  </h3>
                </v-card-title>
                <v-card-text>
                  <v-checkbox
                    v-model="experimentalClientNextSupport"
                    label="Enable Next Client Version (Experimental)"
                    hide-details
                    @change="onExperimentalClientNextSupportChange"
                  >
                    <template v-slot:label>
                      <span>Enable Next Client Version (Experimental)</span>
                    </template>
                  </v-checkbox>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveSettings">Save Settings</v-btn>
          <v-btn text @click="resetSettings">Reset to Default</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { SettingsService } from "@/backend";

const experimentalMoonrakerSupport = ref(false);
const experimentalTypeORMSupport = ref(false);
const experimentalClientNextSupport = ref(false);

async function loadSettings() {
  const settings = await SettingsService.getSettings();
  experimentalMoonrakerSupport.value = settings.server.experimentalMoonrakerSupport;
  experimentalTypeORMSupport.value = settings.server.experimentalTypeormSupport;
  experimentalClientNextSupport.value = settings.server.experimentalClientNextSupport;
}

onMounted(async () => {
  await loadSettings();
});

const saveSettings = async () => {
  await SettingsService.updateExperimentalMoonrakerSupport(experimentalMoonrakerSupport.value);
  await SettingsService.updateExperimentalClientNextSupport(experimentalClientNextSupport.value);
  await loadSettings();
};

const resetSettings = async () => {
  await SettingsService.updateExperimentalMoonrakerSupport(false);
  await SettingsService.updateExperimentalClientNextSupport(false);
  await loadSettings();
};

const onExperimentalClientNextSupportChange = async () => {
  await SettingsService.updateExperimentalClientNextSupport(experimentalClientNextSupport.value);
  window.location.reload(); // Reload the page when enabled
};
</script>
