<template>
  <v-card
      v-drop-upload="{ printers: [printer] }"
      :class="{ 'tile-selected': selected, 'tile-setup': printer }"
      :disabled="!printer"
      :style="{ 'background-color': printerStateColor }"
      class="tile"
      outlined
      tile
      @click="selectPrinter()"
  >
    <v-container v-if="printer">
      <small class="small-resized-font ml-2">
        {{ printer.printerName }}
      </small>
      <v-btn class="float-right" icon @click.prevent.stop="clickInfo()">
        <v-icon>info</v-icon>
      </v-btn>
      <v-btn class="float-right d-none d-lg-inline" icon @click.prevent.stop="clickStop()">
        <v-icon>stop</v-icon>
      </v-btn>
      <br/>
      <small class="xsmall-resized-font ml-2 text--secondary">
        {{ printer.printerState.state }}
      </small>
    </v-container>
    <v-progress-linear
        v-if="printer && printer.currentJob"
        :value="printer.currentJob.progress"
        absolute
        bottom
        color="green"
    >
    </v-progress-linear>
  </v-card>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import {usePrintersStore} from "@/stores/printers";
import {computed} from "vue";

const printersStore = usePrintersStore();
const {printer, loading = false} = defineProps<{ printer: Printer, loading: boolean }>();

const selected = computed(() => {
  if (!printer) return false;
  return printersStore.isSelectedPrinter(printer?.id);
});
const printers = computed(() => printersStore.printers);
const printerStateColor = computed(() => printer?.printerState.colour.hex || "rgba(0,0,0,0)");
const id = computed(() => printer?.printerName);

function getTileClass() {
  return selected ? "tile tile-selected" : "tile";
}

function clickInfo() {
  printersStore.setSideNavPrinter(printer);
}

function clickStop() {
  printersStore.sendStopJobCommand(printer.id);
}

function selectPrinter() {
  if (!printer) return;

  printersStore.toggleSelectedPrinter(printer);
}
</script>

<style>
.tile {
  min-height: 75px;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}

.tile-setup:hover {
  border: 1px solid red !important;
}

.tile-selected {
  border: 1px solid green !important;
}

.small-resized-font {
  font-size: clamp(10px, 1vw, 18px);
}

.xsmall-resized-font {
  font-size: clamp(8px, 1vw, 10px);
}
</style>
