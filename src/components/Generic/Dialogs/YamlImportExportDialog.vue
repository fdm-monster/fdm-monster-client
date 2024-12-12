<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="800px"
    @beforeOpened="onBeforeDialogOpened"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    <v-card class="pa-8">
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
              label="Select a YAML file for import *"
            />

            <v-alert type="error" v-if="errorMessage">
              {{ errorMessage }}
              <br />
              Details: {{ errorDetailedMessage.slice(0, 75) }}
              <span v-if="errorDetailedMessage.length > 75">...</span>
            </v-alert>
          </div>
          <div v-else>
            <v-checkbox v-model="exportFloors" class="pa-0 ma-0 mt-2 ml-2" label="Include floors" />
            <v-checkbox
              v-model="exportGroups"
              :disabled="disableExportGroups"
              class="pa-0 ma-0 mt-2 ml-2"
              label="Include groups"
            />
            <v-checkbox v-model="exportPrinters" class="pa-0 ma-0 ml-2" label="Include printers" />
            <v-checkbox
              v-model="exportFloorGrid"
              class="pa-0 ma-0 ml-2"
              label="Include grid positions (auto-includes printers)"
            />

            Include notes (for yourself):
            <v-textarea v-model="notes" rows="1"></v-textarea>
          </div>
          <v-btn v-if="!isImportMode" @click="downloadExportYamlFile()">
            <v-icon>download</v-icon>
            Export YAML file
          </v-btn>
          <v-btn v-if="isImportMode" :disabled="!isFileProvided" @click="uploadAndImportYamlFile()">
            <v-icon>upload</v-icon>
            Import YAML data
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog()">
          <v-icon class="pr-2">close</v-icon>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { ServerPrivateService } from "@/backend/server-private.service";
import { useDialog } from "@/shared/dialog.composable";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useFeatureStore } from "@/store/features.store";
import { computed, ref } from "vue";

const featureStore = useFeatureStore();
const dialog = useDialog(DialogName.YamlImportExport);
const snackbar = useSnackbar();

const errorMessage = ref("");
const errorDetailedMessage = ref("");
const selectedMode = ref(0);
const exportFloors = ref(true);
const exportFloorGrid = ref(true);
const exportGroups = ref(true);
const exportPrinters = ref(true);
const importFile = ref(undefined);
const notes = ref("");

const disableExportGroups = computed(() => {
  return !featureStore.hasFeature("printerGroupsApi");
});

const isFileProvided = computed(() => {
  return !!importFile.value;
});

const isImportMode = computed(() => {
  return selectedMode.value === 0;
});

const onBeforeDialogOpened = async () => {
  await featureStore.loadFeatures();
  exportGroups.value = featureStore.hasFeature("printerGroupsApi");
};

const onDialogOpened = async () => {};

const downloadExportYamlFile = async () => {
  if (exportFloorGrid.value) {
    exportPrinters.value = true;
  }

  await ServerPrivateService.downloadYamlExport({
    exportPrinters: exportPrinters.value,
    exportGroups: exportGroups.value,
    exportFloorGrid: exportFloorGrid.value,
    printerComparisonStrategiesByPriority: ["name", "url"],
    exportFloors: exportFloors.value,
    floorComparisonStrategiesByPriority: "floor",
    notes: notes.value,
  });
  snackbar.openInfoMessage({
    title: "Downloaded the YAML file",
  });
  notes.value = "";
};

const uploadAndImportYamlFile = async () => {
  errorMessage.value = "";
  errorDetailedMessage.value = "";
  if (!importFile.value) {
    errorMessage.value = "The import file was not specified";
    return;
  }
  try {
    await ServerPrivateService.uploadAndImportYaml(importFile.value);
    importFile.value = undefined;
    snackbar.openInfoMessage({
      title: "Imported the YAML file",
    });
    closeDialog();
  } catch (e) {
    errorMessage.value = "An error occurred during import";
    errorDetailedMessage.value = (e as Error).message.toString();
    importFile.value = undefined;
  }
};

const closeDialog = () => {
  importFile.value = undefined;
  dialog.closeDialog();
};
</script>
