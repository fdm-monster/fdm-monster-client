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
      <v-btn v-for="f in floors" :key="f._id">
        <v-icon>format_align_left</v-icon>
        {{ f.name }}
      </v-btn>
    </v-btn-toggle>

    <v-btn color="primary" class="mt-0 ml-6" v-if="!printerStore.printers?.length" to="/printers">
      You have no printers. Click here to start!
    </v-btn>
    <v-alert color="primary" class="mt-4 ml-12" v-if="floorStore.floorlessPrinters.length">
      <v-icon>warning</v-icon>
      {{ floorStore.floorlessPrinters.length }} unplaced printer(s)!</v-alert
    >
    <div class="ma-4 pt-6">
      <v-switch v-model="gridStore.gridEditMode" label="Printer Relocate Mode"></v-switch>
    </div>
    <v-spacer></v-spacer>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrinterStore } from "../../store/printer.store";
import { useGridStore } from "../../store/grid.store";
import { useFloorStore } from "../../store/floor.store";

export default defineComponent({
  name: "HomeToolbar",
  components: {},
  setup() {
    return {
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
      gridStore: useGridStore(),
    };
  },
  data(): {
    selectedFloorToggleIndex: number;
  } {
    return {
      selectedFloorToggleIndex: 0,
    };
  },
  computed: {
    floors() {
      return this.floorStore.floors;
    },
  },
  methods: {
    changeFloorIndex(index: any) {
      this.floorStore.changeSelectedFloorByIndex(index);
      this.selectedFloorToggleIndex = index;
    },
  },
});
</script>
