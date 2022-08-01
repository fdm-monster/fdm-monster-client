<template>
  <v-container
    v-if="printer"
    v-drop-upload="{ printers: [printer] }"
    :style="dragging ? 'background-color:red' : ''"
    transition="scale-transition"
  >
    <v-row>
      <v-col>
        Name: {{ printer.printerName }} <br />
        URL: {{ printer.printerURL }} <br />
        Host: {{ printer.hostState.state }} -
        <small>
          <strong>{{ printer.hostState.desc }}</strong>
        </small>
        <br />
        WebSocket: {{ printer.webSocketState.colour }} <br />
        Printer: {{ printer.printerState.state }} <br />
        Files: {{ printerFileCount }} <br />
        Sort Index: {{ printer.sortIndex }}
      </v-col>
      <v-col>
        <RefreshFilesAction :printer="printer" class="d-flex justify-end" />
        <PrinterDeleteAction :printer="printer" class="d-flex justify-end" />
      </v-col>
    </v-row>

    <!--    <FileList v-if="printer.fileList" :file-list="printer.fileList" :printer-id="printerId" />-->
  </v-container>
</template>

<script lang="ts">
import type { Printer } from "@/models/printers/printer.model";

export default defineComponent({
  data: () => ({
    dragging: false,
  }),
  setup: () => {
    const { printer } = defineProps<{ printer: Printer }>();
    return {
      printerFilesStore: usePrinterFilesStore(),
      printerId: computed(() => {
        return printer.id;
      }),
      printer,
    };
  },
  computed: {
    printerFileCount() {
      return (
        this.printerFilesStore.printerFileBucket(this.printer.id)?.files
          .length || 0
      );
    },
  },
});
</script>
