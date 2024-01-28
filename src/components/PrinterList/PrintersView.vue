<template>
  <v-card>
    <v-card-title>
      Printers
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        class="p-2"
        clearable
        label="Search"
        prepend-icon="search"
        single-line
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :expanded.sync="expanded"
      :headers="tableHeaders"
      :items="printers"
      :search="search"
      :single-expand="true"
      class="elevation-1"
      item-key="id"
      show-expand
      @click:row="clickRow"
    >
      <template v-slot:no-results>
        <div class="mt-4 mb-4">
          <h3>No printer has been found. Create one here:</h3>
          <PrinterCreateAction />
        </div>
      </template>
      <template v-slot:no-data>
        <div class="mt-4 mb-4">
          <h3>No printer has been created yet. Create one here:</h3>
          <PrinterCreateAction />
        </div>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Showing {{ printers.length || 0 }} printers</v-toolbar-title>
          <v-btn class="ml-3" outlined type="button" @click="openImportJsonPrintersDialog()">
            <v-icon>publish</v-icon>
            Import OctoFarm Printers
          </v-btn>
          <v-btn class="ml-3" outlined type="button" @click="openCreatePrinterDialog()">
            <v-icon>add</v-icon>
            Create Printer
          </v-btn>
          <v-btn class="ml-3" color="primary" type="button" @click="openYamlImportExportDialog()">
            <v-icon>publish</v-icon>
            Import/Export YAML
          </v-btn>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>
      <template v-slot:item.enabled="{ item }">
        <v-switch
          v-model="item.enabled"
          color="primary"
          dark
          inset
          @click.native.capture.stop="toggleEnabled($event, item)"
        >
          {{ item.enabled }}
        </v-switch>
      </template>
      <template v-slot:item.name="{ item }">
        <v-chip color="primary" dark>
          {{ item.name || item.printerURL }}
        </v-chip>
      </template>
      <template v-slot:item.floor="{ item }">
        <v-chip v-if="item.id" color="primary" dark> {{ floorOfPrinter(item.id)?.name }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <PrinterUrlAction :printer="item" />
        <PrinterConnectionAction :printer="item" />
        <PrinterEmergencyStopAction :printer="item" />
        <SyncPrinterNameAction :printer="item" />
        <PrinterDeleteAction :printer="item" />
        <PrinterSettingsAction :printer="item" v-on:update:show="openEditDialog(item)" />
      </template>
      <template v-slot:item.socketupdate="{ item }">
        <span v-if="currentEventReceivedAt[item.id]">
          Updated {{ diffSeconds(currentEventReceivedAt[item.id]) }} seconds ago
        </span>
        <span v-else> No update received (silence)</span>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <PrinterDetails :printer="item"></PrinterDetails>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend/printers.service";
import PrinterDetails from "@/components/PrinterList/PrinterDetails.vue";
import PrinterUrlAction from "@/components/Generic/Actions/PrinterUrlAction.vue";
import PrinterSettingsAction from "@/components/Generic/Actions/PrinterSettingsAction.vue";
import PrinterConnectionAction from "@/components/Generic/Actions/PrinterConnectionAction.vue";
import PrinterEmergencyStopAction from "@/components/Generic/Actions/PrinterEmergencyStopAction.vue";
import SyncPrinterNameAction from "@/components/Generic/Actions/SyncPrinterNameAction.vue";

import { usePrinterStore } from "@/store/printer.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import PrinterCreateAction from "@/components/Generic/Actions/PrinterCreateAction.vue";
import PrinterDeleteAction from "@/components/Generic/Actions/PrinterDeleteAction.vue";
import { useFloorStore } from "@/store/floor.store";
import { usePrinterStateStore } from "@/store/printer-state.store";

interface Data {
  showJsonImportDialog: boolean;
  search: string;
  expanded: PrinterDto[];
  tableHeaders: any[];
}

export default defineComponent({
  name: "PrintersView",
  components: {
    PrinterDeleteAction,
    PrinterDetails,
    PrinterUrlAction,
    PrinterSettingsAction,
    PrinterEmergencyStopAction,
    PrinterCreateAction,
    SyncPrinterNameAction,
    PrinterConnectionAction,
  },
  setup: () => {
    return {
      printerStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
      floorStore: useFloorStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  props: {},
  data: (): Data => ({
    showJsonImportDialog: false,
    search: "",
    expanded: [],
    tableHeaders: [
      { text: "Enabled", value: "enabled" },
      {
        text: "Printer Name",
        align: "start",
        sortable: true,
        value: "name",
      },
      { text: "Floor", value: "floor", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
      { text: "Socket Update", value: "socketupdate", sortable: false },
      { text: "", value: "data-table-expand" },
    ],
  }),
  async created() {},
  async mounted() {},
  computed: {
    printers() {
      return this.printerStore.printers;
    },
    currentEventReceivedAt() {
      return this.printerStateStore.printerCurrentEventReceivedAtById;
    },
  },
  methods: {
    diffSeconds(timestamp: number) {
      if (!timestamp) return;
      const now = Date.now();
      return (now - timestamp) / 1000;
    },
    floorOfPrinter(printerId: string) {
      return this.floorStore.floorOfPrinter(printerId);
    },
    openEditDialog(printer: PrinterDto) {
      this.printerStore.setUpdateDialogPrinter(printer);
      this.dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
    },
    openCreatePrinterDialog() {
      this.dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
    },
    clickRow(item: PrinterDto, event: any) {
      if (event.isExpanded) {
        const index = this.expanded.findIndex((i) => i === item);
        this.expanded.splice(index, 1);
      } else {
        this.expanded.push(item);
      }
    },
    async openImportJsonPrintersDialog() {
      this.dialogsStore.openDialogWithContext(DialogName.BatchJsonCreate);
    },
    async openYamlImportExportDialog() {
      this.dialogsStore.openDialogWithContext(DialogName.YamlImportExport);
    },
    async toggleEnabled(event: any, printer: PrinterDto) {
      if (!printer.id) {
        throw new Error("Printer ID not set, cant toggle enabled");
      }

      printer.enabled = !printer.enabled;
      await PrintersService.toggleEnabled(printer.id, printer.enabled);
    },
  },
  watch: {},
});
</script>

<style lang="scss">
.disabled-highlight tbody {
  tr:hover {
    background-color: transparent !important;
  }
}

.reorder-row-icon {
  cursor: move;
}
</style>
