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
                  <div class="d-flex align-center">
                    <v-checkbox
                      v-model="experimentalMoonrakerSupport"
                      :disabled="isMoonrakerSupportLoading"
                      @change="updateMoonrakerSupport"
                      hide-details
                    >
                      <template v-slot:label>
                        <span>Enable Experimental Moonraker Support</span>
                      </template>
                    </v-checkbox>
                    <v-progress-circular
                      v-if="isMoonrakerSupportLoading"
                      indeterminate
                      size="30"
                      width="4"
                      class="ml-2 mt-4"
                    />
                    <v-icon v-if="showMoonrakerSuccess" color="success" class="ml-2 mt-4">
                      check_circle
                    </v-icon>
                  </div>

                  <!-- Warning message -->
                  <v-alert v-if="experimentalMoonrakerSupport" type="warning" class="mt-2" outlined>
                    Disabling Moonraker support will disable all printers of type Moonraker. You
                    need to re-enable them after re-enabling this feature.
                  </v-alert>
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
                  <div class="d-flex align-center">
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
                  </div>
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
                  <div class="d-flex align-center">
                    <v-checkbox
                      v-model="experimentalClientSupport"
                      :disabled="isClientLoading"
                      @change="updateClientSupport"
                      hide-details
                    >
                      <template v-slot:label>
                        <span>Enable Next Client Version (Experimental)</span>
                      </template>
                    </v-checkbox>
                    <v-progress-circular
                      v-if="isClientLoading"
                      indeterminate
                      size="30"
                      width="4"
                      class="ml-2 mt-4"
                    />
                    <v-icon v-if="showClientSuccess" color="success" class="ml-2 mt-4">
                      check_circle
                    </v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { SettingsService } from "@/backend";

const experimentalMoonrakerSupport = ref(false);
const experimentalTypeORMSupport = ref(false);
const experimentalClientSupport = ref(false);
const isMoonrakerSupportLoading = ref(false);
const isClientLoading = ref(false);
const showMoonrakerSuccess = ref(false);
const showClientSuccess = ref(false);

async function loadSettings() {
  const settings = await SettingsService.getSettings();
  experimentalMoonrakerSupport.value = settings.server.experimentalMoonrakerSupport;
  experimentalTypeORMSupport.value = settings.server.experimentalTypeormSupport;
  experimentalClientSupport.value = settings.server.experimentalClientSupport;
}

onMounted(async () => {
  await loadSettings();
});

const updateMoonrakerSupport = async () => {
  isMoonrakerSupportLoading.value = true;
  showMoonrakerSuccess.value = false;

  try {
    await SettingsService.updateExperimentalMoonrakerSupport(experimentalMoonrakerSupport.value);
    await loadSettings();
    setTimeout(() => {
      isMoonrakerSupportLoading.value = false;
      showMoonrakerSuccess.value = true;
    }, 250);

    setTimeout(() => {
      showMoonrakerSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Failed to update Moonraker support:", error);
    experimentalMoonrakerSupport.value = !experimentalMoonrakerSupport.value;
    isMoonrakerSupportLoading.value = false;
  }
};

const updateClientSupport = async () => {
  isClientLoading.value = true;
  showClientSuccess.value = false;

  try {
    await SettingsService.updateExperimentalClientSupport(experimentalClientSupport.value);
    setTimeout(() => {
      isClientLoading.value = false;
      showClientSuccess.value = true;

      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 100);

    // Set a timeout to hide the success icon after page reload starts
    setTimeout(() => {
      showClientSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Failed to update Client support:", error);
    experimentalClientSupport.value = !experimentalClientSupport.value;
    isClientLoading.value = false;
  }
};
</script>
