<template>
  <v-container
    v-if="printer"
    v-drop-upload="{ printers: [printer] }"
    :style="dragging ? 'background-color:red' : ''"
    transition="scale-transition"
  >
    <v-row>
      <v-col>
        Name: {{ printer.name }} <br />
        URL: {{ printer.printerURL }} <br />
        Host:
        <v-chip small>{{ apiState }}</v-chip>
        <br />
        WebSocket:
        <v-chip small>{{ socketState }}</v-chip>
        <br />
        Printer:
        <v-chip small>{{ printerTextState }}</v-chip>
      </v-col>
      <v-col>
        <RefreshFilesAction :printer="printer" class="d-flex justify-end" />
      </v-col>
    </v-row>

    <FileControlList :file-list="printer.fileList" :printer-id="printerId" />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import FileControlList from "@/components/PrinterList/FileControlList.vue";
import { Printer } from "@/models/printers/printer.model";
import RefreshFilesAction from "@/components/Generic/Actions/RefreshFilesAction.vue";
import { usePrinterStore } from "../../store/printer.store";
import { usePrinterStateStore } from "../../store/printer-state.store";

interface Data {
  dragging: boolean;
}

export default defineComponent({
  name: "PrinterDetails",
  components: {
    FileControlList,
    RefreshFilesAction,
  },
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {
    printer: Object as PropType<Printer>,
  },
  data: (): Data => ({
    dragging: false,
  }),
  computed: {
    printerId() {
      return this.printer?.id;
    },
    socketState() {
      if (!this.printerId) return;
      return this.printerStateStore.socketStatesById[this.printerId]?.socket;
    },
    apiState() {
      if (!this.printerId) return;
      return this.printerStateStore.socketStatesById[this.printerId]?.api;
    },
    printerTextState() {
      if (!this.printerId) return;
      return this.printerStateStore.printerEventsById[this.printerId]?.current?.payload?.state.text;
    },
  },
  methods: {},
  watch: {},
});
</script>
