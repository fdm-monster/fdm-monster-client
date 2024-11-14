<template>
  <v-toolbar flat>
    <v-toolbar-title>Floors</v-toolbar-title>
    <v-btn-toggle
      :value="selectedFloorToggleIndex"
      class="ml-7"
      mandatory
      rounded
      @change="changeFloorIndex"
    >
      <v-btn v-for="f in floors" :key="f.id">
        <v-icon>format_align_left</v-icon>
        {{ f.name }}
      </v-btn>
    </v-btn-toggle>

    <v-btn v-if="!printerStore.printers?.length" class="mt-0 ml-6" color="primary" to="/printers">
      You have no printers. Click here to start!
    </v-btn>
    <v-alert v-if="floorStore.floorlessPrinters.length" class="mt-4 ml-12" color="primary">
      <v-icon>warning</v-icon>
      {{ floorStore.floorlessPrinters.length }} unplaced printer(s)!
    </v-alert>
    <div class="ma-4 pt-6">
      <v-switch v-model="gridStore.gridEditMode" label="Printer Relocate Mode"></v-switch>
    </div>

    <!-- Optional grid controls -->
    <div class="controls-container ma-4">
      <div class="d-flex gap-4">
        <v-text-field
          :value="rows"
          @change="updateGridRows"
          type="number"
          label="Rows"
          :min="1"
          density="compact"
          hide-details
        />
        <v-text-field
          :value="columns"
          @change="updateGridColumns"
          type="number"
          label="Columns"
          :min="1"
          density="compact"
          hide-details
        />
      </div>
    </div>

    <v-spacer></v-spacer>
    <span class="d-flex flex-wrap gap-2">
      <span class="pr-2">
        <v-icon>print</v-icon>
        {{ printerStateStore.printingCount }}
      </span>
      <span class="pr-2">
        <v-icon>ac_unit</v-icon>
        {{ printerStateStore.operationalNotPrintingCount }}
      </span>
      <span class="pr-2">
        <v-icon>handyman</v-icon>
        {{ printerStore.maintenanceCount }}
      </span>
      <span class="pr-2">
        <v-icon>usb_off</v-icon>
        {{ printerStore.disconnectedCount }}
      </span>
      <span class="pr-2">
        <v-icon>print_disabled</v-icon>
        {{ printerStore.disabledCount }}
      </span>
    </span>
  </v-toolbar>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { usePrinterStore } from "@/store/printer.store";
import { useGridStore } from "@/store/grid.store";
import { useFloorStore } from "@/store/floor.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useSettingsStore } from "@/store/settings.store";

const printerStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();
const floorStore = useFloorStore();
const gridStore = useGridStore();
const settingsStore = useSettingsStore();

const loading = ref<boolean>(false);
const selectedFloorToggleIndex = ref<number>(0);

const floors = computed(() => {
  return floorStore.floors;
});
const columns = computed(() => settingsStore.gridCols);
const rows = computed(() => settingsStore.gridRows);

function changeFloorIndex(index: any) {
  floorStore.changeSelectedFloorByIndex(index);
  selectedFloorToggleIndex.value = index;
}

async function updateGridRows(newRows: string) {
  return updateGridSettings(newRows, String(columns.value));
}

async function updateGridColumns(newColumns: string) {
  return updateGridSettings(String(rows.value), newColumns);
}

async function updateGridSettings(rows: string, columns: string) {
  // TODO Vuetify 2 does not have a number type. Therefore, we must parse strings. This will not be necessary for Vuetify 3.
  try {
    loading.value = true;
    await settingsStore.updateFrontendSettings({
      gridRows: parseInt(rows),
      gridCols: parseInt(columns),
      largeTiles: settingsStore.largeTiles,
    });
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.controls-container {
  max-width: 400px;
}
</style>
