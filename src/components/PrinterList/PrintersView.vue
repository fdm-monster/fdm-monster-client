<template>
  <div>
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
            @click.native.capture.stop="toggleEnabled(item)"
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
          <v-chip v-if="item.id" color="primary"> {{ floorOfPrinter(item.id)?.name }}</v-chip>
        </template>
        <template v-if="hasPrinterGroupFeature" v-slot:item.group="{ item }">
          <v-chip close small @click:close="deletePrinterFromGroup(1, item)"> Fake</v-chip>
          <v-chip
            v-for="group of groupsOfPrinter(item.id)"
            :key="group.id"
            close
            color=""
            small
            @click:close="deletePrinterFromGroup(group.id, item)"
          >
            {{ group.name }}
          </v-chip>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                :disabled="!groupsWithPrinters.length"
                class="ml-2"
                color=""
                small
                v-bind="attrs"
                v-on="on"
              >
                <v-icon small>add</v-icon>
              </v-chip>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in []" :key="index">
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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

    <v-card class="mt-4">
      <v-card-title>Printer Groups</v-card-title>

      <v-card-text>
        <h3>Existing groups:</h3>

        <v-chip
          small
          v-for="group of groupsWithPrinters"
          :key="group.id"
          :label="group.name"
          close
          @click:close="deleteGroup(group.id)"
        >
          {{ group.name }}
        </v-chip>

        <h3>Add group</h3>

        <v-text-field v-model="newGroupName" label="Group Name" placeholder="Type group name here">
          Name</v-text-field
        >

        <v-btn @click="createGroup()">Save</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
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
import { IdType } from "@/utils/id.type";
import { PrinterDto } from "@/models/printers/printer.model";
import { useFeatureStore } from "@/store/features.store";
import { useQuery } from "@tanstack/vue-query";
import { useSnackbar } from "@/shared/snackbar.composable";
import { GroupWithPrintersDto, PrinterGroupService } from "@/backend/printer-group.service";

const snackbar = useSnackbar();
const printerStore = usePrinterStore();
const loading = ref<boolean>(false);
const printerStateStore = usePrinterStateStore();
const floorStore = useFloorStore();
const dialogsStore = useDialogsStore();
const featureStore = useFeatureStore();
const groupsWithPrinters = ref<GroupWithPrintersDto<IdType>[]>([]);
const newGroupName = ref("");

const search = ref("");
const expanded = ref([]);
const hasPrinterGroupFeature = computed(() => featureStore.hasFeature("printerGroupsApi"));
const tableHeaders = computed(() => [
  { text: "Enabled", value: "enabled" },
  { text: "Printer Name", align: "start", sortable: true, value: "name" },
  { text: "Floor", value: "floor", sortable: false },
  ...(hasPrinterGroupFeature.value ? [{ text: "Group(s)", value: "group", sortable: true }] : []),
  { text: "Actions", value: "actions", sortable: false },
  { text: "Socket Update", value: "socketupdate", sortable: false },
  { text: "", value: "data-table-expand" },
]);

async function loadData() {
  loading.value = true;
  groupsWithPrinters.value = await PrinterGroupService.getGroupsWithPrinters();
  loading.value = false;
  return printers;
}

const printerGroupsQuery = useQuery({
  queryKey: ["printerGroups"],
  queryFn: loadData,
  enabled() {
    return hasPrinterGroupFeature.value;
  },
  throwOnError(error, query) {
    throw error;
  },
});

const printers = computed(() => printerStore.printers);
const currentEventReceivedAt = computed(() => printerStateStore.printerCurrentEventReceivedAtById);

const diffSeconds = (timestamp: number) => {
  if (!timestamp) return;
  const now = Date.now();
  return (now - timestamp) / 1000;
};

const groupsOfPrinter = (printerId: IdType) => {
  return groupsWithPrinters.value.filter((g) => g.printers.find((p) => p.printerId === printerId));
};

const floorOfPrinter = (printerId: IdType) => {
  return floorStore.floorOfPrinter(printerId);
};

const openEditDialog = (printer: PrinterDto) => {
  printerStore.setUpdateDialogPrinter(printer);
  dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
};

const openCreatePrinterDialog = () => {
  dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
};

const clickRow = (item: PrinterDto, event: any) => {
  if (event.isExpanded) {
    const index = expanded.value.findIndex((i) => i === item);
    expanded.value.splice(index, 1);
  } else {
    expanded.value.push(item);
  }
  console.log(event);
};

const openImportJsonPrintersDialog = () => {
  dialogsStore.openDialogWithContext(DialogName.BatchJsonCreate);
};

const openYamlImportExportDialog = () => {
  dialogsStore.openDialogWithContext(DialogName.YamlImportExport);
};

const createGroup = async () => {
  if (!newGroupName.value?.trim()?.length) {
    throw new Error("Please set a non-empty group name");
  }

  await PrinterGroupService.createGroup(newGroupName.value.trim());
  await printerGroupsQuery.refetch();
  snackbar.info("Created group");
};

const deleteGroup = async (groupId: IdType) => {
  await PrinterGroupService.deleteGroup(groupId);
  await printerGroupsQuery.refetch();
  snackbar.info("Deleted group");
};

const addPrinterToGroup = async (groupId: IdType, printer: PrinterDto) => {
  await PrinterGroupService.addPrinterToGroup(groupId, printer.id);
  await printerGroupsQuery.refetch();
  snackbar.info("Added printer to group");
};

const deletePrinterFromGroup = async (groupId: IdType, printer: PrinterDto) => {
  await PrinterGroupService.deletePrinterFromGroup(groupId, printer.id);
  await printerGroupsQuery.refetch();
  snackbar.info("Removed printer from group");
};

const toggleEnabled = async (printer: PrinterDto) => {
  if (!printer.id) {
    throw new Error("Printer ID not set, cant toggle enabled");
  }

  printer.enabled = !printer.enabled;
  await PrintersService.toggleEnabled(printer.id, printer.enabled);
};
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
