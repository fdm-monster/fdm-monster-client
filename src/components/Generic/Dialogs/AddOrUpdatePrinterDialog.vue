<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="showChecksPanel ? '900px' : '700px'"
    @escape="closeDialog()"
  >
    <ValidationObserver ref="validationObserver" v-slot="{ invalid }">
      <v-card class="pa-4">
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials }}
            </v-avatar>
            <span v-if="isUpdating"> Updating Printer </span>
            <span v-else> New Printer </span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="showChecksPanel ? 8 : 12">
              <v-row v-if="formData">
                <v-col>
                  <ValidationProvider v-slot="{ errors }" :rules="printerNameRules" name="Name">
                    <v-text-field
                      v-model="formData.name"
                      :counter="printerNameRules.max"
                      :error-messages="errors"
                      autofocus
                      class="ma-1"
                      label="Printer name*"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <v-col>
                  <ValidationProvider v-slot="{ errors }" name="Enabled">
                    <v-checkbox
                      v-model="formData.enabled"
                      :error-messages="errors"
                      hint="Disabling makes the printer passive"
                      label="Enabled*"
                      persistent-hint
                      required
                    ></v-checkbox>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <ValidationProvider
                v-slot="{ errors }"
                name="Printer URL"
                persistent-hint
                rules="required|url"
              >
                <v-text-field
                  v-model="formData.printerURL"
                  :error-messages="errors"
                  class="ma-1"
                  hint="F.e. 'octopi.local' or 'https://my.printer.com'"
                  label="Printer URL*"
                ></v-text-field>
              </ValidationProvider>

              <ValidationProvider
                v-slot="{ errors }"
                :rules="apiKeyRules"
                name="ApiKey"
                style="width: 100%"
              >
                <v-text-field
                  v-model="formData.apiKey"
                  :counter="apiKeyRules.length"
                  :error-messages="errors"
                  class="ma-1"
                  hint="User or Application Key only (Global API key fails)"
                  label="API Key*"
                  persistent-hint
                  required
                ></v-text-field>
              </ValidationProvider>
            </v-col>

            <PrinterChecksPanel v-if="showChecksPanel" :cols="4">
              <v-btn @click="showChecksPanel = false">Hide checks</v-btn>
            </PrinterChecksPanel>
          </v-row>
          <v-alert color="primary" class="my-3" v-if="printerValidationError?.length">
            {{ printerValidationError }}
            <v-checkbox color="warning" v-model="forceSavePrinter" label="Force save" />
          </v-alert>
          <v-alert class="my-3" v-if="validatingPrinter">
            Validating printer
            <v-progress-circular indeterminate />
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn
            v-if="isUpdating"
            :disabled="invalid"
            color="gray"
            text
            @click="duplicatePrinter()"
          >
            Duplicate
          </v-btn>
          <v-btn :disabled="invalid" color="warning" text @click="testPrinter()">
            Test connection
          </v-btn>

          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">
            {{ submitButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </ValidationObserver>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { generateInitials, newRandomNamePair } from "@/shared/noun-adjectives.data";
import { usePrinterStore } from "@/store/printer.store";
import { PrintersService } from "@/backend";
import PrinterChecksPanel from "@/components/Generic/Dialogs/PrinterChecksPanel.vue";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useTestPrinterStore } from "@/store/test-printer.store";
import {
  CreatePrinter,
  getDefaultCreatePrinter,
} from "@/models/printers/crud/create-printer.model";
import { useDialog } from "@/shared/dialog.composable";
import { AppConstants } from "@/shared/app.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import { AxiosError } from "axios";

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog);
const printersStore = usePrinterStore();
const testPrinterStore = useTestPrinterStore();
const appConstants = inject<AppConstants>("appConstants");
const snackbar = useSnackbar();

const printerValidationError = ref<null | string>(null);
const validatingPrinter = ref(false);
const forceSavePrinter = ref(false);
const showChecksPanel = ref(false);
const copyPasteConnectionString = ref("");
const formData = ref(getDefaultCreatePrinter());

const printerId = computed(() => printersStore.updateDialogPrinter?.id);

onMounted(() => {
  if (printerId.value) {
    const crudeData = printersStore.printer(printerId.value) as CreatePrinter;
    formData.value = PrintersService.convertPrinterToCreateForm(crudeData);
  }
});

watch(printerId, (val) => {
  if (!val) return;
  const printer = printersStore.printer(val) as CreatePrinter;
  formData.value = PrintersService.convertPrinterToCreateForm(printer);
});

const storedPrinter = computed(() => printersStore.updateDialogPrinter);
const validationObserver = ref(null);
const isUpdating = computed(() => !!storedPrinter.value);
const submitButtonText = computed(
  () => (forceSavePrinter.value ? "Force " : "") + (isUpdating.value ? "Save" : "Create")
);

const avatarInitials = computed(() => {
  if (formData.value) {
    return generateInitials(formData.value?.name);
  }
  return "?";
});

const printerNameRules = computed(() => ({
  required: true,
  max: appConstants!.maxPrinterNameLength,
}));

const apiKeyRules = computed(() => ({
  required: true,
  length: appConstants!.apiKeyLength,
  alpha_num: true,
}));

const resetForm = () => {
  formData.value = getDefaultCreatePrinter();
};

const openTestPanel = () => {
  showChecksPanel.value = true;
};

const testPrinter = async () => {
  if (!(await isValid())) return;
  if (!formData.value) return;

  testPrinterStore.clearEvents();
  openTestPanel();

  const { correlationToken } = await testPrinterStore.createTestPrinter(
    formData.value as CreatePrinter
  );
  testPrinterStore.currentCorrelationToken = correlationToken;
};

const isValid = async () => {
  return await validationObserver.value?.validate();
};

const createPrinter = async (newPrinterData: CreatePrinter) => {
  await printersStore.createPrinter(newPrinterData, forceSavePrinter.value);
  snackbar.openInfoMessage({
    title: `Printer ${newPrinterData.name} created`,
  });
};

const updatePrinter = async (updatedPrinter: CreatePrinter) => {
  const printerId = updatedPrinter.id;

  await printersStore.updatePrinter(
    {
      printerId: printerId as string,
      updatedPrinter,
    },
    forceSavePrinter.value
  );

  snackbar.openInfoMessage({
    title: `Printer ${updatedPrinter.name} updated`,
  });
};

const submit = async () => {
  if (!formData.value || !(await isValid())) return;

  printerValidationError.value = null;
  validatingPrinter.value = true;
  const createdPrinter = formData.value;

  try {
    if (isUpdating.value) {
      await updatePrinter(createdPrinter);
    } else {
      await createPrinter(createdPrinter);
    }
    closeDialog();
  } catch (error) {
    if (error instanceof AxiosError) {
      printerValidationError.value = error.response?.data?.error || error.message;
      snackbar.error("Validation Failed", (error as Error).message);
    } else {
      printerValidationError.value = (error as Error).message;
      snackbar.error("Error", (error as Error).message);
    }
  } finally {
    validatingPrinter.value = false;
  }
};

const duplicatePrinter = () => {
  formData.value.name = newRandomNamePair();
  printersStore.updateDialogPrinter = undefined;
};

const closeDialog = () => {
  dialog.closeDialog();
  showChecksPanel.value = false;
  testPrinterStore.clearEvents();
  resetForm();
  printersStore.updateDialogPrinter = undefined;
  copyPasteConnectionString.value = "";
};
</script>
