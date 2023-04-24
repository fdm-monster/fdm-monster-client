<template>
  <v-toolbar flat>
    <v-toolbar-title>Printer Floors</v-toolbar-title>
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
    <v-spacer></v-spacer>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrintersStore } from "@/store/printers.store";

export default defineComponent({
  name: "HomeToolbar",
  components: {},
  setup() {
    return {
      printersStore: usePrintersStore(),
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
