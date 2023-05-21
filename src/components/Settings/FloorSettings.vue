<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Floor Management</v-toolbar-title>
    </v-toolbar>

    <v-list subheader three-line>
      <v-subheader>Floors</v-subheader>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Create new floor</v-list-item-title>
          <v-list-item-subtitle>
            Creates an empty department/floor to view printer groups
            <br />
            <v-btn color="primary" @click="createFloor()">Create floor</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-row no-gutters>
      <v-col>
        <v-list dense>
          <v-list-item-group v-model="selectedItem">
            <v-list-item v-for="floor of floors" :key="floor._id">
              <v-list-item-content>
                <v-list-item-title>{{ floor.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ floor.printers.length || 0 }} assigned
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action-text> Floor number: {{ floor.floor }}</v-list-item-action-text>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col>
        <v-toolbar>
          <v-hover v-slot="{ hover }">
            <v-toolbar-title>
              <v-edit-dialog
                v-if="selectedFloor"
                @open="setEditedPrinterFloorName"
                @save="updatePrinterFloorName"
              >
                <v-btn color="secondary">
                  <v-icon v-if="hover" small>edit</v-icon>
                  {{ selectedFloor.name }}
                </v-btn>

                <template v-slot:input>
                  <v-text-field
                    v-model="editedFloorName"
                    :return-value.sync="editedFloorName"
                    counter
                    label="Edit"
                    single-line
                  ></v-text-field>
                </template>
              </v-edit-dialog>

              <span v-else> Select a floor on the left </span>
            </v-toolbar-title>
          </v-hover>

          <v-hover v-slot="{ hover }">
            <v-toolbar-title>
              <v-edit-dialog
                v-if="selectedFloor"
                @open="setEditedPrinterFloorNumber"
                @save="updatePrinterFloorNumber"
              >
                <v-btn color="secondary">
                  <v-icon v-if="hover" small>edit</v-icon>
                  {{ selectedFloor.floor }}
                </v-btn>

                <template v-slot:input>
                  <v-text-field
                    v-model="editedFloorNumber"
                    :return-value.sync="editedFloorNumber"
                    label="Edit"
                    single-line
                    type="number"
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </v-toolbar-title>
          </v-hover>

          <v-spacer></v-spacer>

          <v-btn v-if="selectedFloor" color="primary" @click="clickDeleteFloor()">
            <v-icon>delete</v-icon>
            Delete floor
          </v-btn>
        </v-toolbar>

        <v-list v-if="selectedFloor">
          <v-list-item v-if="!floorPrinterAssignmentHidden()">
            <!-- New group -->
            <v-list-item-content>
              <v-select
                :items="unassignedPrinters"
                item-text="name"
                label="Not assigned"
                no-data-text="No printer groups left, create more"
                outlined
                return-object
                @change="addPrinterToFloor(selectedFloor, $event)"
              ></v-select>
            </v-list-item-content>
          </v-list-item>

          <!-- Existing groups -->
          <v-list-item v-for="x in showAddedPrinters" :key="x">
            <v-list-item-content v-if="printerInFloor(selectedFloor, x)">
              <v-list-item-title>
                {{ printerInFloor(selectedFloor, x).printerName }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action v-if="printerInFloor(selectedFloor, x)">
              <v-btn @click="clearPrinterGroupFromFloor(selectedFloor, x)">
                <v-icon>close</v-icon>
                Clear
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Floor } from "../../models/floors/floor.model";
import { usePrinterStore } from "../../store/printer.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { Printer } from "../../models/printers/printer.model";
import { floorPrinterAssignmentHidden } from "../../constants/experimental.constants";
import { useFloorStore } from "../../store/floor.store";

interface Data {
  editedFloorName: string;
  editedFloorNumber: number;
  selectedItem: number;
}

export default defineComponent({
  name: "FloorSettings",
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      floorStore: useFloorStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  props: {},
  data: (): Data => ({
    selectedItem: 0,
    editedFloorName: "",
    editedFloorNumber: 0,
  }),
  created() {},
  mounted() {},
  computed: {
    floors() {
      return this.floorStore.floors;
    },
    selectedFloor() {
      return this.floorStore.floors[this.selectedItem];
    },
    showAddedPrinters() {
      return this.selectedFloor.printers?.length + 1;
    },
    unassignedPrinters() {
      return this.floorStore.floorlessPrinters;
    },
  },
  methods: {
    floorPrinterAssignmentHidden() {
      return floorPrinterAssignmentHidden;
    },
    printerInFloor(floor: Floor, index: number): Printer | undefined {
      if (!floor?.printers) return;

      const floorPrinter = floor.printers[index - 1];
      if (!floorPrinter) return;
      return this.printersStore.printer(floorPrinter.printerId);
    },
    async createFloor() {
      this.dialogsStore.openDialog(DialogName.CreatePrinterFloorDialog);
    },
    setEditedPrinterFloorName() {
      this.editedFloorName = this.selectedFloor.name;
    },
    setEditedPrinterFloorNumber() {
      this.editedFloorNumber = this.selectedFloor.floor;
    },
    async updatePrinterFloorName() {
      if (!this.selectedFloor?._id) return;
      const { _id: floorId } = this.selectedFloor;
      await this.floorStore.updateFloorName({
        floorId,
        name: this.editedFloorName,
      });
    },
    async updatePrinterFloorNumber() {
      if (!this.selectedFloor?._id) return;
      const { _id: floorId } = this.selectedFloor;
      await this.floorStore.updateFloorNumber({
        floorId,
        floorNumber: this.editedFloorNumber,
      });
      // Adapt to potential sort change
      this.selectedItem = -1;
    },
    async clickDeleteFloor() {
      if (!this.selectedFloor?._id) return;

      await this.floorStore.deleteFloor(this.selectedFloor._id);
    },
    async addPrinterToFloor(floor: Floor, printer: Printer) {
      if (!this.selectedFloor._id || !printer?.id) return;

      // TODO this will fail because X < 0 and Y < 0
      await this.floorStore.addPrinterToFloor({
        floorId: this.selectedFloor._id,
        printerId: printer.id,
        x: -1,
        y: -1,
      });
    },
    async clearPrinterGroupFromFloor(floor: Floor, index: number) {
      const printer = this.printerInFloor(floor, index);
      if (!floor?._id || !printer?.id) return;

      await this.floorStore.deletePrinterFromFloor({
        floorId: floor._id,
        printerId: printer.id,
      });
    },
  },
  watch: {},
});
</script>
