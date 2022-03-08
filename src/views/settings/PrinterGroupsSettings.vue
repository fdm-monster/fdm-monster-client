<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Printer Group Management</v-toolbar-title>
    </v-toolbar>

    <v-list subheader three-line>
      <v-subheader>Printer Groups</v-subheader>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Legacy Groups</v-list-item-title>
          <v-list-item-subtitle>
            Convert the legacy printer group to the new separate PrinterGroup data.
            <br/>
            <v-btn color="primary" @click="syncLegacyGroups()">Sync legacy</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Create new group</v-list-item-title>
          <v-list-item-subtitle>
            Creates an empty group to be placed on the grid
            <br/>
            <v-btn color="primary" @click="createGroup()">Create group</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-row no-gutters>
      <v-col>
        <v-list dense>
          <v-list-item-group v-model="selectedItem">
            <v-list-item v-for="group of printerGroups" :key="group._id">
              <v-list-item-content>
                <v-list-item-title>{{ group.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ group.printers.length || 0 }} assigned
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action-text>
                X: {{ group.location.x }}, Y: {{ group.location.y }}
              </v-list-item-action-text>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col>
        <v-toolbar>
          <v-hover v-slot="{ hover }">
            <v-toolbar-title>
              <v-edit-dialog
                  v-if="selectedPrinterGroup"
                  @open="setEditedPrinterGroupName"
                  @save="updatePrinterGroupName"
              >
                <v-btn color="secondary">
                  <v-icon v-if="hover" small>edit</v-icon>
                  {{ selectedPrinterGroup.name }}
                </v-btn>

                <template v-slot:input>
                  <v-text-field
                      v-model="editedPrinterGroupName"
                      :return-value.sync="editedPrinterGroupName"
                      counter
                      label="Edit"
                      single-line
                  ></v-text-field>
                </template>
              </v-edit-dialog>

              <span v-else> Select a group on the left </span>
            </v-toolbar-title>
          </v-hover>

          <v-spacer></v-spacer>

          <v-btn v-if="selectedPrinterGroup" color="primary" @click="clickDeleteGroup()">
            <v-icon>delete</v-icon>
            Delete group
          </v-btn>
        </v-toolbar>

        <v-list v-if="selectedPrinterGroup">
          <v-list-item v-for="x in printersPerGroup" :key="x">
            <v-list-item-content v-if="printerInGroup(selectedPrinterGroup, x)">
              <v-list-item-title>
                {{ printerInGroup(selectedPrinterGroup, x).printerName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ printerLocation(selectedPrinterGroup, x) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-content v-else>
              <v-select
                  :items="unassignedPrinters()"
                  item-text="printerName"
                  label="Not assigned"
                  no-data-text="No printers left"
                  outlined
                  return-object
                  @change="addPrinterToGroup(selectedPrinterGroup, x, $event)"
              ></v-select>
            </v-list-item-content>

            <v-list-item-action v-if="printerInGroup(selectedPrinterGroup, x)">
              <v-btn @click="clearPrinterFromGroup(selectedPrinterGroup, x)">
                <v-icon>close</v-icon>
                Clear
              </v-btn>
            </v-list-item-action>
            <v-list-item-action v-else>
              <v-btn color="primary" disabled>
                <v-icon>add</v-icon>
                Assign
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import {PrinterGroupService} from "@/backend";
import type {PrinterGroup} from "@/models/printers/printer-group.model";
import type {Printer} from "@/models/printers/printer.model";
import {usePrinterGroupsStore} from "@/stores/printer-groups";
import {computed, ref} from "vue";
import {usePrintersStore} from "@/stores/printers";

const printerGroupsStore = usePrinterGroupsStore();
const printersStore = usePrintersStore();
const selectedItem = ref(0);
const editedPrinterGroupName = ref("");

const printersPerGroup = 4;

const printerGroups = computed(() => {
  return printerGroupsStore.printerGroups;
});

const selectedPrinterGroup = computed(() => {
  return printerGroupsStore.printerGroups[selectedItem.value];
});

function printerLocation(group: PrinterGroup, index: number) {
  return group?.printers[index - 1]?.location;
}

function unassignedPrinters() {
  return printerGroupsStore.ungroupedPrinters;
}

function printerInGroup(group: PrinterGroup, index: number): Printer | undefined {
  if (!group?.printers) return;

  const printer = group.printers[index - 1];
  return printersStore.printer(printer?.printerId);
}

async function createGroup() {
  // Trigger watch connected to printer group CRUD dialog
  printerGroupsStore.setCreateGroupDialogOpened(true);
}

async function syncLegacyGroups() {
  const groups = await PrinterGroupService.syncLegacyGroups();

  // TODO bus
  // this.$bus.emit(infoMessageEvent, `Succesfully synced ${groups.length} groups!`);
}

function setEditedPrinterGroupName() {
  editedPrinterGroupName.value = selectedPrinterGroup.value.name;
}

async function updatePrinterGroupName() {
  if (!selectedPrinterGroup?.value._id) return;

  const {_id: groupId} = selectedPrinterGroup.value;
  await printerGroupsStore.updatePrinterGroupName({groupId, name: editedPrinterGroupName});
}

async function clickDeleteGroup() {
  if (!selectedPrinterGroup?.value._id) return;

  await printerGroupsStore.deletePrinterGroup(selectedPrinterGroup.value._id);
}

async function addPrinterToGroup(group: PrinterGroup, position: number, printer: Printer) {
  if (!selectedPrinterGroup.value._id) return;
  const location = (position - 1).toString();
  await printerGroupsStore.addPrinterToGroup({
    groupId: selectedPrinterGroup.value._id,
    printerId: printer.id,
    location
  });
}

async function clearPrinterFromGroup(group: PrinterGroup, index: number) {
  const printer = printerInGroup(group, index);
  if (!group?._id || !printer) return;

  await printerGroupsStore.deletePrinterFromGroup({groupId: group._id, printerId: printer.id});
}

</script>
