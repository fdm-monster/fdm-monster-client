<template>
  <div>
    <v-card>
      <v-card-title>
        Printers
        <v-spacer></v-spacer>
        <v-select
          v-if="hasPrinterGroupFeature && groupsWithPrinters.length"
          multiple
          :items="groupsWithPrinters"
          item-text="name"
          :return-object="true"
          v-model="filteredGroupsWithPrinters"
          placeholder="Select group to filter by"
          prepend-icon="filter_list"
          label="Filter by groups"
        >
        </v-select>
        <v-text-field
          v-model="search"
          class="p-2"
          clearable
          label="Printer search"
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
          <v-chip
            v-for="group of groupsOfPrinter(item.id)"
            :key="group.id"
            close
            small
            class="ml-2"
            @click:close="deletePrinterFromGroup(group.id, item.id)"
          >
            {{ group.name }}
          </v-chip>

          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                :disabled="!groupsWithPrinters.length"
                class="ml-2"
                small
                v-bind="attrs"
                v-on="on"
              >
                <v-icon small>add</v-icon>
              </v-chip>
            </template>

            <v-list dense style="border: 1px solid dimgray">
              <v-subheader>ADD TO GROUP</v-subheader>
              <v-list-item-group>
                <v-list-item
                  @click="addPrinterToGroup(group.id, item.id)"
                  v-for="(group, index) in nonGroupsOfPrinter(item.id)"
                  :key="index"
                >
                  <v-list-item-title>{{ group.name }}</v-list-item-title>
                </v-list-item>
              </v-list-item-group>
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

    <v-card class="mt-4" v-if="hasPrinterGroupFeature">
      <v-card-title>Printer Groups</v-card-title>

      <v-card-text>
        <h3>Existing groups:</h3>

        <v-container>
          <v-chip-group
            v-model="selectedGroup"
            @change="selectGroupForUpdatingName()"
            active-class="primary--text"
            column
          >
            <v-chip
              small
              v-for="group of groupsWithPrinters"
              :key="group.id"
              close
              @click:close="deleteGroup(group.id)"
              class="mr-3"
            >
              {{ group.name }}
            </v-chip>
          </v-chip-group>
        </v-container>

        <h3 class="mt-3">Update group name</h3>
        <v-container>
          <v-alert v-if="!selectedGroupObject"> Select a group to update its name. </v-alert>
          <v-text-field
            :disabled="!selectedGroupObject"
            v-model="updatedGroupName"
            label="Group Name"
            placeholder="Type group name here"
          >
            Name
          </v-text-field>
          <v-btn @click="updateGroupName(selectedGroupObject)">Update name</v-btn>
        </v-container>

        <h3 class="mt-3">Add group</h3>

        <v-container>
          <v-text-field
            v-model="newGroupName"
            label="Group Name"
            placeholder="Type group name here"
          >
            Name
          </v-text-field>
          <v-btn @click="createGroup()">Create new group</v-btn>
        </v-container>
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
import { AppService } from "@/backend/app.service";

const snackbar = useSnackbar();
const printerStore = usePrinterStore();
const loading = ref<boolean>(false);
const printerStateStore = usePrinterStateStore();
const floorStore = useFloorStore();
const dialogsStore = useDialogsStore();
const featureStore = useFeatureStore();
const groupsWithPrinters = ref<GroupWithPrintersDto<IdType>[]>([]);
const filteredGroupsWithPrinters = ref<GroupWithPrintersDto<IdType>[]>([]);
const newGroupName = ref("");
const updatedGroupName = ref("");
const selectedGroup = ref<number>();

const search = ref("");
const expanded = ref([]);
const hasPrinterGroupFeature = computed(() => featureStore.hasFeature("printerGroupsApi"));
const tableHeaders = computed(() => [
  { text: "Enabled", value: "enabled" },
  { text: "Printer Name", align: "start", sortable: true, value: "name" },
  { text: "Floor", value: "floor", sortable: false },
  ...(featureStore.hasFeature("printerGroupsApi")
    ? [{ text: "Group(s)", value: "group", sortable: true }]
    : []),
  { text: "Actions", value: "actions", sortable: false },
  { text: "Socket Update", value: "socketupdate", sortable: false },
  { text: "", value: "data-table-expand" },
]);

async function loadData() {
  loading.value = true;
  await featureStore.loadFeatures();
  if (featureStore.hasFeature("printerGroupsApi")) {
    const response = await PrinterGroupService.getGroupsWithPrinters();
    groupsWithPrinters.value = response;
  }
  loading.value = false;
  return groupsWithPrinters;
}

const printerGroupsQuery = useQuery({
  queryKey: ["printerGroups"],
  queryFn: loadData,
});

const printers = computed(() => {
  if (!featureStore.hasFeature("printerGroupsApi") || !filteredGroupsWithPrinters.value?.length) {
    return printerStore.printers;
  }
  const printerIdsInFilteredGroups =
    filteredGroupsWithPrinters.value.flatMap((g) => g.printers.map((p) => p.printerId)) || [];
  return printerStore.printers.filter((p) => printerIdsInFilteredGroups.includes(p.id));
});

const currentEventReceivedAt = computed(() => printerStateStore.printerCurrentEventReceivedAtById);
const selectedGroupObject = computed(() => {
  if (!selectedGroup.value && selectedGroup.value !== 0) return;

  return groupsWithPrinters.value[selectedGroup.value];
});

const diffSeconds = (timestamp: number) => {
  if (!timestamp) return;
  const now = Date.now();
  return (now - timestamp) / 1000;
};

const groupsOfPrinter = (printerId: IdType) => {
  return groupsWithPrinters.value.filter((g) => g.printers.find((p) => p.printerId === printerId));
};

const nonGroupsOfPrinter = (printerId: IdType) => {
  return groupsWithPrinters.value.filter((g) => !g.printers.find((p) => p.printerId === printerId));
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
  newGroupName.value = "";
  snackbar.info("Created group");
};

const selectGroupForUpdatingName = () => {
  if (!selectedGroupObject.value) return;

  updatedGroupName.value = selectedGroupObject.value?.name;
};

const updateGroupName = async (group?: GroupWithPrintersDto) => {
  if (!group?.id) {
    throw new Error("Group id was not defined");
  }
  const existingGroup = groupsWithPrinters.value.find((g) => g.id === group.id);
  if (!existingGroup) {
    throw new Error("Group was not found, please reload the page");
  }
  if (!updatedGroupName.value?.trim()?.length) {
    throw new Error("Please set a non-empty group name");
  }

  await PrinterGroupService.updateGroupName(group.id, updatedGroupName.value.trim());
  await printerGroupsQuery.refetch();
};

const deleteGroup = async (groupId: IdType) => {
  const existingGroup = groupsWithPrinters.value.find((g) => g.id === groupId);
  if (!existingGroup) {
    throw new Error("Group was not found, please reload the page");
  }

  const printerCount = existingGroup.printers.length;
  if (
    printerCount > 0 &&
    !confirm(`This group contains ${printerCount} printers, are you sure to delete it?`)
  ) {
    return;
  }

  await PrinterGroupService.deleteGroup(groupId);
  await printerGroupsQuery.refetch();
  snackbar.info("Deleted group");
};

const addPrinterToGroup = async (groupId: IdType, printerId: IdType) => {
  await PrinterGroupService.addPrinterToGroup(groupId, printerId);
  await printerGroupsQuery.refetch();
  snackbar.info("Added printer to group");
};

const deletePrinterFromGroup = async (groupId: IdType, printerId: IdType) => {
  await PrinterGroupService.deletePrinterFromGroup(groupId, printerId);
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
