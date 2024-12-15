<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

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
            <v-list-item v-for="floor of floors" :key="floor.id">
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
          <v-list-item v-for="x in showAddedPrinters" :key="x">
            <v-list-item-content v-if="printerInFloor(selectedFloor, x)">
              <v-list-item-title>
                {{ printerInFloor(selectedFloor, x)?.name }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action v-if="printerInFloor(selectedFloor, x)">
              <v-btn @click="deletePrinterFromFloor(selectedFloor, x)">
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
import { FloorDto } from "@/models/floors/floor.model";
import { usePrinterStore } from "@/store/printer.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { PrinterDto } from "@/models/printers/printer.model";
import { useFloorStore } from "@/store/floor.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { useDialog } from "@/shared/dialog.composable";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

interface Data {
  editedFloorName: string;
  editedFloorNumber: number;
  selectedItem: number;
}

export default defineComponent({
  name: "FloorSettings",
  components: { SettingsToolbar },
  setup: () => {
    return {
      page: settingsPage["floors"],
      printersStore: usePrinterStore(),
      floorStore: useFloorStore(),
      addOrUpdateFloorDialog: useDialog(DialogName.AddOrUpdateFloorDialog),
      snackbar: useSnackbar(),
    };
  },
  data: (): Data => ({
    selectedItem: 0,
    editedFloorName: "",
    editedFloorNumber: 0,
  }),
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
  },
  methods: {
    printerInFloor(floor: FloorDto, index: number): PrinterDto | undefined {
      if (!floor?.printers) return;

      const floorPrinter = floor.printers[index - 1];
      if (!floorPrinter) return;
      return this.printersStore.printer(floorPrinter.printerId);
    },
    async createFloor() {
      await this.addOrUpdateFloorDialog.openDialog();
    },
    setEditedPrinterFloorName() {
      this.editedFloorName = this.selectedFloor.name;
    },
    setEditedPrinterFloorNumber() {
      this.editedFloorNumber = this.selectedFloor.floor;
    },
    async updatePrinterFloorName() {
      if (!this.selectedFloor?.id) return;
      const { id: floorId } = this.selectedFloor;
      await this.floorStore.updateFloorName({
        floorId,
        name: this.editedFloorName,
      });
      this.snackbar.info("Floor name updated");
    },
    async updatePrinterFloorNumber() {
      if (!this.selectedFloor?.id) return;
      const { id: floorId } = this.selectedFloor;
      await this.floorStore.updateFloorNumber({
        floorId,
        floorNumber: this.editedFloorNumber,
      });
      this.snackbar.info("Floor level updated");
      // Adapt to potential sort change
      this.selectedItem = -1;
    },
    async clickDeleteFloor() {
      if (!this.selectedFloor?.id) return;

      await this.floorStore.deleteFloor(this.selectedFloor.id);
      this.snackbar.info("Floor deleted");
    },
    async deletePrinterFromFloor(floor: FloorDto, index: number) {
      const printer = this.printerInFloor(floor, index);
      if (!floor?.id || !printer?.id) return;

      await this.floorStore.deletePrinterFromFloor({
        floorId: floor.id,
        printerId: printer.id,
      });
      this.snackbar.info("Printer removed from floor");
    },
  },
});
</script>
