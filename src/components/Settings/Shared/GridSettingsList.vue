<template>
  <v-card-text>
    <SettingSection title="Printer grid - rows and columns" :usecols="false">
      <v-row v-if="settingsStore.settings?.frontend">
        <v-col cols="3">
          <v-select
            @input="updateGridRows"
            v-model="settingsStore.settings.frontend.gridRows"
            :items="rowOptions"
            label="Set the grid rows"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            @input="updateGridColumns"
            v-model="settingsStore.settings.frontend.gridCols"
            :items="colOptions"
            label="Set the grid columns"
          />
        </v-col>
      </v-row>
    </SettingSection>

    <v-divider />

    <SettingSection title="Printer tile - large or compact tiles" :usecols="false">
      <v-row v-if="settingsStore.settings?.frontend">
        <v-col cols="5">
          <v-checkbox
            @change="updateGridSettings"
            v-model="settingsStore.settings.frontend.largeTiles"
            label="Large tiles"
          />
        </v-col>
      </v-row>
    </SettingSection>

    <v-divider />

    <SettingSection title="Printer tile - stop button">
      <v-row v-if="settingsStore.settings?.frontend">
        <v-col cols="5">
          <v-checkbox
            @change="updateGridSettings"
            v-model="settingsStore.settings.frontend.tilePreferCancelOverQuickStop"
            label="Print tile - show cancel instead of quick stop"
          />
        </v-col>
      </v-row>
    </SettingSection>
  </v-card-text>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store/settings.store";
import { colOptions, rowOptions } from "@/shared/printer-grid.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import { computed } from "vue";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";

const settingsStore = useSettingsStore();
const snackbar = useSnackbar();

const largeTilesSettings = computed(() => settingsStore.largeTiles);
const tilePreferCancelOverQuickStop = computed(() => settingsStore.preferCancelOverQuickStop);

async function updateGridColumns(newColumns: string) {
  return updateGridSettingsInner(parseInt(newColumns), settingsStore.gridRows);
}

async function updateGridRows(newRows: string) {
  return updateGridSettingsInner(settingsStore.gridCols, parseInt(newRows));
}

async function updateGridSettings() {
  return updateGridSettingsInner(settingsStore.gridCols, settingsStore.gridRows);
}

async function updateGridSettingsInner(columns: number, rows: number) {
  await settingsStore.updateFrontendSettings({
    gridCols: columns,
    gridRows: rows,
    largeTiles: largeTilesSettings.value,
    tilePreferCancelOverQuickStop: tilePreferCancelOverQuickStop.value,
  });
  snackbar.info("Grid settings updated");
}
</script>
