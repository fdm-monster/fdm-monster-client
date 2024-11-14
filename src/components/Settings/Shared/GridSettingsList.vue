<template>
  <div>
    <v-card-text>
      <v-list subheader three-line>
        <v-subheader>Grid Rows and Columns</v-subheader>
        <v-list-item>
          <v-list-item-content>
            <v-row v-if="settingsStore.settings?.frontend">
              <v-col cols="3">
                <v-select
                  @change="updateGridRows"
                  v-model="settingsStore.settings.frontend.gridRows"
                  :items="rowOptions"
                  label="Set the grid rows"
                />
              </v-col>
              <v-col cols="3">
                <v-select
                  @change="updateGridColumns"
                  :value="settingsStore.settings.frontend.gridCols"
                  :items="colOptions"
                  label="Set the grid columns"
                />
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />
      <v-list subheader three-line>
        <v-subheader>Large or Compact Tiles</v-subheader>
        <v-list-item>
          <v-list-item-content>
            <v-row v-if="settingsStore.settings?.frontend">
              <v-col cols="5">
                <v-checkbox
                  @change="updateGridSettings"
                  v-model="settingsStore.settings.frontend.largeTiles"
                  label="Large tiles"
                />
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store/settings.store";
import { colOptions, rowOptions } from "@/shared/printer-grid.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { computed } from "vue";

const settingsStore = useSettingsStore();
const snackbar = useSnackbar();

const largeTilesSettings = computed(() => settingsStore.largeTiles);

async function updateGridColumns(newRows: string) {
  return updateGridSettings(parseInt(newRows), settingsStore.gridRows);
}

async function updateGridRows(newColumns: string) {
  return updateGridSettings(settingsStore.gridRows, parseInt(newColumns));
}

async function updateGridSettings(columns: number, rows: number) {
  await settingsStore.updateFrontendSettings({
    gridCols: columns,
    gridRows: rows,
    largeTiles: largeTilesSettings.value,
  });
  snackbar.info("Grid settings updated");
}
</script>
