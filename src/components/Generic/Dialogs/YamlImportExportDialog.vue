<template>
  <BaseDialog :id="dialogId" max-width="700px">
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> YAML export and import </span>
      </v-card-title>
      <v-card-text>
        <div>Choose mode:</div>
        <v-row>
          <br />
          <v-radio-group v-model="selectedMode" class="ml-3" row>
            <v-radio :value="0" label="Import YAML" />
            <v-radio :value="1" label="Export YAML" />
          </v-radio-group>
        </v-row>

        <div>
          <div v-if="isImportMode" class="pl-2">
            <v-file-input
              v-model="importFile"
              accept=".yaml"
              label="Select a YAML file for import"
            ></v-file-input>
            {{ importFile }}
          </div>

          <v-checkbox v-model="exportFloors" class="pa-0 ma-0 mt-2 ml-2" label="Include floors" />
          <v-checkbox v-model="exportPrinters" class="pa-0 ma-0 ml-2" label="Include printers" />
          <v-checkbox
            v-model="exportFloorGrid"
            class="pa-0 ma-0 ml-2"
            label="Include grid positions (auto-includes printers)"
          />

          Include notes (for yourself):
          <v-textarea v-model="notes" rows="2"></v-textarea>

          <v-btn v-if="!isImportMode" @click="downloadExportYamlFile()">
            <v-icon>download</v-icon>
            Export YAML file
          </v-btn>
          <v-btn v-if="isImportMode" :disabled="!isFileProvided">
            <v-icon>upload</v-icon>
            Import YAML data
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <em class="red--text">* indicates required field</em>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrintersStore } from "@/store/printers.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { WithDialog } from "@/utils/dialog.utils";
import { ServerPrivateService } from "../../../backend/server-private.service";

interface Data extends WithDialog {
  selectedMode: number;
  exportFloors: boolean;
  exportFloorGrid: boolean;
  exportPrinters: boolean;
  notes?: string;
  importFile?: File;
}

export default defineComponent({
  name: "YamlImportExportDialog",
  components: {},
  setup: () => {
    return {
      printersStore: usePrintersStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    dialogId: DialogName.YamlImportExport,
    selectedMode: 0,
    exportFloors: true,
    exportFloorGrid: true,
    exportPrinters: true,
    importFile: undefined,
    notes: "",
  }),
  computed: {
    isFileProvided() {
      return !!this.importFile;
    },
    isImportMode() {
      return this.selectedMode === 0;
    },
  },
  methods: {
    async downloadExportYamlFile() {
      if (this.exportFloorGrid) {
        this.exportPrinters = true;
      }
      await ServerPrivateService.downloadYamlExport({
        exportPrinters: this.exportPrinters,
        exportFloorGrid: this.exportFloorGrid,
        printerComparisonStrategiesByPriority: ["name", "url"],
        exportFloors: this.exportFloors,
        floorComparisonStrategiesByPriority: "name",
        notes: this.notes,
      });
    },
    closeDialog() {
      this.dialogsStore.closeDialog(this.dialogId);
    },
  },
  watch: {},
});
</script>
