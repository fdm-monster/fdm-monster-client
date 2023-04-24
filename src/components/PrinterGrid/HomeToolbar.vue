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

    <v-btn color="primary" class="mt-0 ml-6" v-if="!printersStore.printers?.length" to="/printers">
      You have no printers. Click here to start!
    </v-btn>
    <v-alert color="primary" class="mt-4 ml-12" v-if="printersStore.floorlessPrinters.length">
      <v-icon>warning</v-icon>
      {{ printersStore.floorlessPrinters.length }} unplaced printer(s)!</v-alert
    >
    <div class="ma-4 pt-6">
      <v-switch v-model="gridStore.gridEditMode" label="Printer Relocate Mode"></v-switch>
    </div>
    <v-spacer></v-spacer>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrintersStore } from "@/store/printers.store";
import { useGridStore } from "../../store/grid.store";

export default defineComponent({
  name: "HomeToolbar",
  components: {},
  setup() {
    return {
      printersStore: usePrintersStore(),
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
      return this.printersStore.floors;
    },
  },
  methods: {
    changeFloorIndex(index: any) {
      this.printersStore.changeSelectedFloorByIndex(index);
      this.selectedFloorToggleIndex = index;
    },
  },
});
</script>
