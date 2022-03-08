<template>
  <v-container
      v-if="printer"
      v-drop-upload="{ printers: [printer] }"
      :style="dragging ? 'background-color:red' : ''"
      transition="scale-transition"
  >
    <v-row>
      <v-col>
        Name: {{ printer.printerName }} <br/>
        URL: {{ printer.printerURL }} <br/>
        Host: {{ printer.hostState.state }} -
        <small>
          <strong>{{ printer.hostState.desc }}</strong>
        </small>
        <br/>
        WebSocket: {{ printer.webSocketState.colour }} <br/>
        Printer: {{ printer.printerState.state }} <br/>
        Files: {{ getPrinterFileCount() }} <br/>
        Sort Index: {{ printer.sortIndex }}
      </v-col>
      <v-col>
        <RefreshFilesAction :printer="printer" class="d-flex justify-end"/>
        <PrinterDeleteAction :printer="printer" class="d-flex justify-end"/>
      </v-col>
    </v-row>

    <FileList :file-list="printer.fileList" :printer-id="printerId"/>
  </v-container>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import PrinterDeleteAction from "@/components/Actions/PrinterDeleteAction.vue";
import RefreshFilesAction from "@/components/Actions/RefreshFilesAction.vue";
import {usePrinterFilesStore} from "@/stores/printer-files";
import {computed} from "vue";

const printerFilesStore = usePrinterFilesStore();

const {printer} = defineProps<{ printer: Printer }>();
let dragging = false;

const printerId = computed(() => {
  return printer.id;
});

function getPrinterFileCount() {
  return printerFilesStore.printerFileBucket(printer.id)?.files.length || 0;
}
</script>
