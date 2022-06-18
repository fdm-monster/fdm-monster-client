<template>
  <v-toolbar>
    <v-avatar>
      <v-icon>settings</v-icon>
    </v-avatar>
    <v-toolbar-title>Printer Group Management</v-toolbar-title>
  </v-toolbar>

  <v-list subheader three-line>
    <v-list-subheader>Printer Groups</v-list-subheader>

    <v-list-item>
      <v-list-item-header>
        <v-list-item-title>Legacy Groups</v-list-item-title>
        <v-list-item-subtitle>
          Convert the legacy printer group to the new separate PrinterGroup
          data.
        </v-list-item-subtitle>
        <v-btn color="primary" @click="syncLegacyGroups()">Sync legacy</v-btn>
      </v-list-item-header>
    </v-list-item>

    <v-list-item>
      <v-list-item-header>
        <v-list-item-title>Create new group</v-list-item-title>
        <v-list-item-subtitle>
          Creates an empty group to be placed on the grid
        </v-list-item-subtitle>
        <v-btn color="primary" @click="createGroup()">Create group</v-btn>
      </v-list-item-header>
    </v-list-item>
  </v-list>

  <v-divider></v-divider>

  <v-row>
    <v-col>
      <v-list dense density="compact" two-line>
        Selected index: {{ selectedItem }} Printer groups:
        {{ printerGroups.length }}
        <v-list-item
          v-for="group of printerGroups"
          :key="group._id"
          :value="selectedItem"
        >
          <v-list-item-header>
            <v-list-item-title>{{ group.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ group.printers.length || 0 }} assigned
            </v-list-item-subtitle>
          </v-list-item-header>
          <!--              <v-list-item-action-text>-->
          <!--                X: {{ group.location.x }}, Y: {{ group.location.y }}-->
          <!--              </v-list-item-action-text>-->
        </v-list-item>
      </v-list>
    </v-col>

    <v-col>
      <!--        <v-toolbar>-->
      <!--          <v-hover v-slot="{ hover }">-->
      <!--            <v-toolbar-title>-->
      <!--              <v-edit-dialog-->
      <!--                v-if="selectedPrinterGroup"-->
      <!--                @open="setEditedPrinterGroupName"-->
      <!--                @save="updatePrinterGroupName"-->
      <!--              >-->
      <!--                <v-btn color="secondary">-->
      <!--                  <v-icon v-if="hover" small>edit</v-icon>-->
      <!--                  {{ selectedPrinterGroup.name }}-->
      <!--                </v-btn>-->

      <!--                <template v-slot:input>-->
      <!--                  <v-text-field-->
      <!--                    v-model="editedPrinterGroupName"-->
      <!--                    :return-value.sync="editedPrinterGroupName"-->
      <!--                    counter-->
      <!--                    label="Edit"-->
      <!--                    single-line-->
      <!--                  ></v-text-field>-->
      <!--                </template>-->
      <!--              </v-edit-dialog>-->

      <!--              <span v-else> Select a group on the left </span>-->
      <!--            </v-toolbar-title>-->
      <!--          </v-hover>-->

      <!--          <v-spacer></v-spacer>-->

      <!--          <v-btn-->
      <!--            v-if="selectedPrinterGroup"-->
      <!--            color="primary"-->
      <!--            @click="clickDeleteGroup()"-->
      <!--          >-->
      <!--            <v-icon>delete</v-icon>-->
      <!--            Delete group-->
      <!--          </v-btn>-->
      <!--        </v-toolbar>-->

      <v-list v-if="selectedPrinterGroup" two-line>
        <v-list-item v-for="x in printersPerGroup" :key="x">
          <v-list-item-header v-if="printerInGroup(selectedPrinterGroup, x)">
            <v-list-item-title>
              {{ printerInGroup(selectedPrinterGroup, x).printerName }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ printerLocation(selectedPrinterGroup, x) }}
            </v-list-item-subtitle>
          </v-list-item-header>
          <v-list-item-header v-else>
            <v-select
              :items="unassignedPrinters()"
              item-text="printerName"
              label="Not assigned"
              no-data-text="No printers left"
              outlined
              return-object
              @change="addPrinterToGroup(selectedPrinterGroup, x)"
            ></v-select>
          </v-list-item-header>

          <template v-slot:append>
            <v-list-item-avatar end>
              <v-btn icon="information" variant="text"></v-btn>
            </v-list-item-avatar>
          </template>

          <!-- TODO -->
          <!--            <VListItemAction v-if="printerInGroup(selectedPrinterGroup, x)">-->
          <!--              <v-btn @click="clearPrinterFromGroup(selectedPrinterGroup, x)">-->
          <!--                <v-icon>close</v-icon>-->
          <!--                Clear-->
          <!--              </v-btn>-->
          <!--            </VListItemAction>-->
          <!--            <v-list-item-action v-else>-->
          <!--              <v-btn color="primary" disabled>-->
          <!--                <v-icon>add</v-icon>-->
          <!--                Assign-->
          <!--              </v-btn>-->
          <!--            </v-list-item-action>-->
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { PrinterGroupService } from "@/backend";
import type { PrinterGroup } from "@/models/printers/printer-group.model";
import type { Printer } from "@/models/printers/printer.model";

export default defineComponent({
  data: () => ({
    printersPerGroup: 4,
  }),
  setup: () => {
    return {
      printersStore: usePrintersStore(),
      printerGroupsStore: usePrinterGroupsStore(),
      editedPrinterGroupName: ref(""),
      selectedItem: ref(0),
    };
  },
  async mounted() {},
  props: {},
  computed: {
    printerGroups() {
      return this.printerGroupsStore.printerGroups;
    },
    selectedPrinterGroup() {
      return this.printerGroupsStore.printerGroups[this.selectedItem];
    },
  },
  methods: {
    printerLocation(group: PrinterGroup, index: number) {
      return group?.printers[index - 1]?.location;
    },
    unassignedPrinters() {
      // TODO Convert to string array to silence typecheck
      return this.printerGroupsStore.ungroupedPrinters.map(
        (p) => p.printerName
      );
    },
    printerInGroup(group: PrinterGroup, index: number): Printer | undefined {
      if (!group?.printers) return;

      const printer = group.printers[index - 1];
      return this.printersStore.printer(printer?.printerId);
    },
    async createGroup() {
      // Trigger watch connected to printer group CRUD dialog
      this.printerGroupsStore.setCreateGroupDialogOpened(true);
    },
    async syncLegacyGroups() {
      const groups = await PrinterGroupService.syncLegacyGroups();

      // TODO bus
      // this.$bus.emit(infoMessageEvent, `Succesfully synced ${groups.length} groups!`);
    },
    setEditedPrinterGroupName() {
      this.editedPrinterGroupName = this.selectedPrinterGroup.name;
    },
    async updatePrinterGroupName() {
      if (!this.selectedPrinterGroup?._id) return;

      const { _id: groupId } = this.selectedPrinterGroup;
      await this.printerGroupsStore.updatePrinterGroupName({
        groupId,
        name: this.editedPrinterGroupName,
      });
    },
    async clickDeleteGroup() {
      if (!this.selectedPrinterGroup?._id) return;

      await this.printerGroupsStore.deletePrinterGroup(
        this.selectedPrinterGroup._id
      );
    },
    addPrinterToGroup(group: PrinterGroup, position: number) {
      return async (printer: Printer) => {
        if (!this.selectedPrinterGroup._id) return;

        const location = (position - 1).toString();
        await this.printerGroupsStore.addPrinterToGroup({
          groupId: this.selectedPrinterGroup._id,
          printerId: printer.id,
          location,
        });
      };
    },
    async clearPrinterFromGroup(group: PrinterGroup, index: number) {
      const printer = this.printerInGroup(group, index);
      if (!group?._id || !printer) return;

      await this.printerGroupsStore.deletePrinterFromGroup({
        groupId: group._id,
        printerId: printer.id,
      });
    },
  },
});
</script>
