<template>
  <v-container>
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
                    <h3>Experimental Features</h3>
                  </v-card-title>
                  <v-card-text>
                    <v-checkbox
                      v-model="experimentalMoonrakerSupport"
                      label="Enable Experimental Moonraker Support"
                      hide-details
                    >
                      <template v-slot:label>
                        <span>Enable Experimental Moonraker Support</span>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">help_outline</v-icon>
                          </template>
                          <span>
                            Moonraker support is currently in beta, use at your own risk. Please
                            connect your Klipper instance to Moonraker in order for FDM Monster to
                            function. Expect breaking changes in this new feature.
                          </span>
                        </v-tooltip>
                      </template>
                    </v-checkbox>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>
                    <h3>Database Settings</h3>
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
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">help_outline</v-icon>
                          </template>
                          <span>
                            By enabling this setting you will set FDM Monster to SQLite as a
                            database source. This allows you to run FDM Monster in standalone mode,
                            dropping the required MongoDB database. The environment variable which
                            controls this cannot be changed when the server is running. Please
                            change 'ENABLE_EXPERIMENTAL_TYPEORM' to 'true' in order to enable this
                            feature and restart FDM Monster.
                          </span>
                        </v-tooltip>
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

const experimentalMoonrakerSupport = ref(false);
const experimentalTypeORMSupport = ref(true);

// Methods to save and reset settings (implement your logic here)
const saveSettings = () => {
  // Save settings logic
  alert("Settings saved!");
};

const resetSettings = () => {
  // Reset settings logic
  alert("Settings reset to default!");
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
