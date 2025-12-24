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

            <v-btn
              v-if="isFileProvided && !importSummary"
              :disabled="!isFileProvided"
              :loading="validatingImport"
              color="secondary"
              class="mb-4"
              @click="validateImportFile()"
            >
              <v-icon class="mr-2">checklist</v-icon>
              Validate & Preview
            </v-btn>

            <v-alert v-if="errorMessage" type="error">
              {{ errorMessage }}
              <br />
              Details: {{ errorDetailedMessage.slice(0, 75) }}
              <span v-if="errorDetailedMessage.length > 75">...</span>
            </v-alert>

            <v-card v-if="importSummary" class="mt-4 pa-4">
              <h4 class="mb-4">
                <v-icon class="mr-2" color="success">info</v-icon>
                Import Summary
              </h4>
              <div class="mb-2">
                <strong>Version:</strong> {{ importSummary.version }}
              </div>
              <div class="mb-2">
                <strong>Database Type:</strong> {{ importSummary.databaseType }}
              </div>
              <div class="mb-2">
                <strong>Exported:</strong> {{ importSummary.exportedAt }}
              </div>
              <v-divider class="my-3" />
              <div class="mb-2">
                <v-icon class="mr-2" small>print</v-icon>
                <strong>Printers:</strong> {{ importSummary.printersCount }}
              </div>
              <div class="mb-2">
                <v-icon class="mr-2" small>layers</v-icon>
                <strong>Floors:</strong> {{ importSummary.floorsCount }}
              </div>
              <div class="mb-2">
                <v-icon class="mr-2" small>group_work</v-icon>
                <strong>Groups:</strong> {{ importSummary.groupsCount }}
              </div>
              <div v-if="importSummary.hasSettings" class="mb-2">
                <v-icon class="mr-2" small color="warning">settings</v-icon>
                <strong>Settings:</strong> Included
              </div>
              <div v-if="importSummary.usersCount > 0" class="mb-2">
                <v-icon class="mr-2" small color="warning">person</v-icon>
                <strong>Users:</strong> {{ importSummary.usersCount }}
              </div>
            </v-card>
          </div>
          <div v-else>
            <v-checkbox v-model="exportFloors" class="pa-0 ma-0 mt-2 ml-2" label="Include floors" />
            <v-checkbox
              v-model="exportGroups"
              class="pa-0 ma-0 mt-2 ml-2"
              label="Include groups"
            />
            <v-checkbox v-model="exportPrinters" class="pa-0 ma-0 ml-2" label="Include printers" />
            <v-checkbox
              v-model="exportFloorGrid"
              class="pa-0 ma-0 ml-2"
              label="Include grid positions (auto-includes printers)"
            />
            <v-checkbox v-model="exportSettings" class="pa-0 ma-0 ml-2" label="Include settings" />
            <v-checkbox v-model="exportUsers" class="pa-0 ma-0 ml-2" label="Include users" />

            Include notes (for yourself):
            <v-textarea v-model="notes" rows="1"></v-textarea>
          </div>
          <v-btn v-if="!isImportMode" @click="downloadExportYamlFile()">
            <v-icon>download</v-icon>
            Export YAML file
          </v-btn>
          <v-btn v-if="isImportMode && importSummary" :disabled="!isFileProvided" @click="uploadAndImportYamlFile()">
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
import { load } from "js-yaml";

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
const exportSettings = ref(true);
const exportUsers = ref(true);
const importFile = ref(undefined);
const notes = ref("");
const validatingImport = ref(false);
const importSummary = ref<any>(null);

const isFileProvided = computed(() => {
  return !!importFile.value;
});

const isImportMode = computed(() => {
  return selectedMode.value === 0;
});

const onBeforeDialogOpened = async () => {
  await featureStore.loadFeatures();
};

const onDialogOpened = async () => {
  importFile.value = undefined;
  errorMessage.value = "";
  errorDetailedMessage.value = "";
  notes.value = "";
  importSummary.value = null;
  validatingImport.value = false;
};

const validateImportFile = async () => {
  if (!importFile.value) {
    errorMessage.value = "No file selected";
    return;
  }

  validatingImport.value = true;
  errorMessage.value = "";
  errorDetailedMessage.value = "";
  importSummary.value = null;

  try {
    const text = await importFile.value.text();
    const parsed = load(text) as any;

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid YAML file format");
    }

    importSummary.value = {
      version: parsed.version || "Unknown",
      databaseType: parsed.databaseType || "Unknown",
      exportedAt: parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : "Unknown",
      printersCount: parsed.printers?.length || 0,
      floorsCount: parsed.floors?.length || 0,
      groupsCount: parsed.groups?.length || 0,
      hasSettings: !!parsed.settings,
      usersCount: parsed.users?.length || 0,
    };

    snackbar.openInfoMessage({ title: "Import file validated successfully" });
  } catch (error: any) {
    errorMessage.value = "Failed to validate import file";
    errorDetailedMessage.value = error.message;
    importSummary.value = null;
  } finally {
    validatingImport.value = false;
  }
};

const downloadExportYamlFile = async () => {
  if (exportFloorGrid.value) {
    exportPrinters.value = true;
  }

  await ServerPrivateService.downloadYamlExport({
    exportPrinters: exportPrinters.value,
    exportGroups: exportGroups.value,
    exportFloorGrid: exportFloorGrid.value,
    exportSettings: exportSettings.value,
    exportUsers: exportUsers.value,
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
  errorMessage.value = "";
  errorDetailedMessage.value = "";
  notes.value = "";
  importSummary.value = null;
  validatingImport.value = false;
  dialog.closeDialog();
};
</script>
