<template>
  <BaseDialog :id="dialog.dialogId" max-width="900px" @escape="closeDialog()">
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> Import OctoFarm Printers </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-stepper v-model="stepProgress" vertical non-linear>
              <v-stepper-step :complete="stepProgress > 1" step="1" editable>
                Export PrintersDB from OctoFarm
              </v-stepper-step>

              <v-stepper-content step="1">
                <v-file-input
                  class="mt-2"
                  style="max-width: 400px"
                  v-model="importFile"
                  filled
                  accept=".json"
                  clearable
                  label="Upload PrintersDB.json file"
                  @change="updatePrinterCount()"
                />

                <ol>
                  <li>
                    <h4>
                      <v-icon>navigation</v-icon>
                      Go to your OctoFarm System page
                    </h4>
                  </li>
                  <li>
                    <h4>
                      <v-icon>mouse</v-icon>
                      Click 'Database'
                    </h4>
                  </li>
                  <li>
                    <h4>
                      <v-icon>mouse</v-icon>
                      Click the button 'Export Printers'
                    </h4>
                  </li>
                  <li>
                    <h4>
                      <v-icon>upload</v-icon>
                      Upload 'PrintersDB.json' above
                    </h4>
                  </li>
                </ol>

                <div class="my-3">
                  <v-icon class="pr-2">info</v-icon>
                  OctoFarm printers should be exported as a JSON file. Please upload the correct
                  "PrintersDB.json" database file using the steps provided.
                  <v-btn small class="ml-2" color="success" @click="showGif = !showGif">
                    <v-icon class="pr-2">gif</v-icon>
                    <span v-if="!showGif">Show GIF</span>
                    <span v-else>Hide GIF</span>
                  </v-btn>
                </div>

                <v-img
                  v-if="showGif"
                  class="my-4"
                  :src="gif"
                  style="border: 3px solid dimgray; max-width: 800px"
                  elevation="10"
                />

                <br />
                <v-btn color="primary" @click="clickValidateAndNext()" :disabled="!importFile">
                  Validate
                </v-btn>
              </v-stepper-content>

              <v-stepper-step :complete="stepProgress > 2" step="2" editable>
                Show printers & decide
              </v-stepper-step>

              <v-stepper-content step="2">
                <div class="my-2">
                  <v-icon class="pr-2">info</v-icon>
                  Import state: {{ validationStatus ? "success" : "failed" }} -
                  {{ numPrinters }} printer(s) found
                </div>

                <v-alert class="my-2" v-if="errorMessage" type="error">
                  {{ errorMessage }}
                  <br />
                  Details: {{ errorDetailedMessage?.slice(0, 75) }}
                  <span v-if="errorDetailedMessage?.length > 75">...</span>
                </v-alert>

                <v-divider class="mt-2" />

                <v-list two-line flat subheader dense class="mt-2">
                  <v-subheader>Found printers</v-subheader>
                  <v-list-item-group v-model="selectedPrinters" multiple>
                    <v-list-item
                      dense
                      v-for="committedPrinter of committedPrinters"
                      :key="committedPrinter.name"
                      :title="committedPrinter.name"
                    >
                      <template v-slot:default="{ active }">
                        <v-list-item-action>
                          <v-checkbox :input-value="active"></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                          <v-list-item-title>
                            {{ committedPrinter.name }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <span class="mr-4">URL: {{ committedPrinter.printerURL }}</span>
                            <span class="mr-4">Enabled: {{ committedPrinter.enabled }}</span>
                            <span class="mr-4">API Key: {{ committedPrinter.apiKey }}</span>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </v-list-item>
                  </v-list-item-group>

                  <v-subheader>
                    <v-btn @click="toggleSelected" class="my-2" small>
                      <v-icon class="mr-2">check</v-icon>
                      Toggle selection
                    </v-btn>
                  </v-subheader>
                </v-list>

                <div class="my-3">
                  <v-icon class="pr-2">info</v-icon>
                  At this moment, the following properties will be imported: enabled, name,
                  printerURL and apiKey
                </div>

                <v-btn
                  class="my-2"
                  color="primary"
                  @click="submit()"
                  :disabled="!selectedPrinters?.length"
                >
                  Submit {{ selectedPrinters?.length }} printers
                </v-btn>
              </v-stepper-content>

              <v-stepper-step :complete="stepProgress > 3" step="3" editable>
                Import printers into FDM Monster
              </v-stepper-step>

              <v-stepper-content step="3">
                <div class="mb-5 mt-10" v-if="importCompletedSuccesfully">
                  <v-icon size="100" class="mr-5" color="green circle">check_circle</v-icon>
                  Import Completed
                </div>
                <div v-else>
                  <v-icon size="100" class="mr-5" color="red circle">error</v-icon>

                  Something went wrong: {{ errorMessage }}
                  <br />
                  <span class="ml-5 mt-2"> Details: {{ errorDetailedMessage?.slice(0, 75) }} </span>
                  <span class="ml-5 mt-2" v-if="errorDetailedMessage?.length > 75">...</span>
                </div>
              </v-stepper-content>
            </v-stepper>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">
          <v-icon class="mr-2">close</v-icon>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { ref } from "vue";
import { PrintersService } from "@/backend";
import gif from "@/assets/octofarm-printer-export.gif";
import { CreatePrinter } from "@/models/printers/crud/create-printer.model";

const stepProgress = ref();
const validationStatus = ref(false);
const showGif = ref(false);
const errorMessage = ref("");
const errorDetailedMessage = ref("");
const importFile = ref<File>();
const numPrinters = ref(0);
const committedPrinters = ref<CreatePrinter[]>([]);
const selectedPrinters = ref<number[]>([]);
const importCompletedSuccesfully = ref<boolean>(false);
const dialog = useDialog(DialogName.BatchJsonCreate);

const parsedPrinters = async () => {
  if (!importFile.value) {
    validationStatus.value = false;
    return;
  }

  const data = JSON.parse(await importFile.value.text());
  if (!data || !Array.isArray(data)) return [];
  if (!data?.length) return [];

  let printers = data;
  // Unwrap the nested array
  if (data.length === 1 && Array.isArray(data[0])) {
    printers = data[0];
  }

  printers = printers.map((p) => {
    if (p["_id"]) {
      delete p["_id"];
    }
    if (p.apikey) {
      p.apiKey = p.apikey;
      delete p.apikey;
    }
    if (p.settingsApperance) {
      p.settingsAppearance = p.settingsApperance;
      delete p.settingsApperance;
    }
    if (p.settingsAppearance?.name) {
      p.name = p.settingsAppearance?.name;
      delete p.settingsAppearance;
    } else {
      p.name = p.printerURL;
    }

    return {
      enabled: !p.disabled,
      apiKey: p.apiKey,
      printerURL: p.printerURL,
      name: p.name,
    };
  });

  let validationFailed = false;
  const failedPrinterNames = [];
  errorMessage.value = "";
  errorDetailedMessage.value = "";
  for (const printer of printers) {
    const props = Object.keys(printer);
    if (
      !(
        props.includes("enabled") &&
        (printer.enabled === false || printer.enabled === true) &&
        props.includes("apiKey") &&
        printer.apiKey.length &&
        props.includes("printerURL") &&
        printer.printerURL.length &&
        props.includes("name") &&
        printer.name
      )
    ) {
      failedPrinterNames.push(printer.name || printer.printerURL || "No name known for printer");
      validationFailed ||= true;
    }
  }

  validationStatus.value = !validationFailed;
  if (validationFailed) {
    errorMessage.value = "Imported file failed the validation step";
    errorDetailedMessage.value =
      "These printers failed validation: " + failedPrinterNames.join(", ");
  }

  return printers;
};

const clickValidateAndNext = async () => {
  const printers = await parsedPrinters();
  if (!printers?.length) return;

  selectedPrinters.value = [...Array(printers.length)].map((x, i) => i);
  committedPrinters.value = printers || [];
  stepProgress.value = 2;
};

const toggleSelected = () => {
  const isOneSelected = selectedPrinters.value.length;
  if (isOneSelected) {
    selectedPrinters.value = [];
  } else {
    selectedPrinters.value = [...Array(committedPrinters.value.length)].map((x, i) => i);
  }
};

const updatePrinterCount = async () => {
  numPrinters.value = (await parsedPrinters())?.length || 0;
};

const submit = async () => {
  stepProgress.value = 3;
  const printers = committedPrinters.value.filter((_, i) => selectedPrinters.value.includes(i));
  if (!printers?.length) {
    return;
  }

  try {
    await PrintersService.batchImportPrinters(printers);
    importCompletedSuccesfully.value = true;
  } catch (e) {
    importCompletedSuccesfully.value = false;
    importFile.value = undefined;
    errorMessage.value = "An error occurred";
    errorDetailedMessage.value = (e as Error).message.toString();
  }
};

const closeDialog = () => {
  importFile.value = undefined;
  dialog.closeDialog();
  stepProgress.value = 1;
};
</script>
