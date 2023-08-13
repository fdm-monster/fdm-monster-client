<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="showChecksPanel ? '900px' : '700px'"
    @escape="closeDialog()"
  >
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
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
                  <validation-provider v-slot="{ errors }" :rules="printerNameRules" name="Name">
                    <v-text-field
                      v-model="formData.printerName"
                      :counter="printerNameRules.max"
                      :error-messages="errors"
                      autofocus
                      class="ma-1"
                      label="Printer name*"
                      required
                    />
                  </validation-provider>
                </v-col>
                <v-col>
                  <validation-provider v-slot="{ errors }" name="Enabled">
                    <v-checkbox
                      v-model="formData.enabled"
                      :error-messages="errors"
                      hint="Disabling makes the printer passive"
                      label="Enabled*"
                      persistent-hint
                      required
                    ></v-checkbox>
                  </validation-provider>
                </v-col>
              </v-row>

              <validation-provider
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
                  label="Printer URL"
                ></v-text-field>
              </validation-provider>

              <validation-provider
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
              </validation-provider>
            </v-col>

            <PrinterChecksPanel v-if="showChecksPanel" :cols="4">
              <v-btn @click="showChecksPanel = false">Hide checks</v-btn>
            </PrinterChecksPanel>
          </v-row>
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
    </validation-observer>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
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
  PreCreatePrinter,
} from "@/models/printers/crud/create-printer.model";
import { useDialog } from "@/shared/dialog.composable";
import { AppConstants } from "@/shared/app.constants";
import { useSnackbar } from "@/shared/snackbar.composable";

const watchedId = "printerId";

interface Data {
  showChecksPanel: boolean;
  copyPasteConnectionString: string;
  formData: PreCreatePrinter;
}

export default defineComponent({
  name: "AddOrUpdatePrinterDialog",
  components: {
    ValidationProvider,
    ValidationObserver,
    PrinterChecksPanel,
  },
  setup: () => {
    const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog);
    return {
      printersStore: usePrinterStore(),
      testPrinterStore: useTestPrinterStore(),
      dialog,
      appConstants: inject("appConstants") as AppConstants,
      snackbar: useSnackbar(),
    };
  },
  async created() {
    if (this.printerId) {
      const crudeData = this.printersStore.printer(this.printerId) as CreatePrinter;
      this.formData = PrintersService.convertPrinterToCreateForm(crudeData);
    }
  },
  async mounted() {},
  props: {},
  data: (): Data => ({
    showChecksPanel: false,
    copyPasteConnectionString: "",
    formData: getDefaultCreatePrinter(),
  }),
  computed: {
    printerId() {
      return this.printersStore.updateDialogPrinter?.id;
    },
    storedPrinter() {
      return this.printersStore.updateDialogPrinter;
    },
    validationObserver() {
      return this.$refs.validationObserver as InstanceType<typeof ValidationObserver>;
    },
    isUpdating() {
      return !!this.storedPrinter;
    },
    submitButtonText() {
      return this.isUpdating ? "Save" : "Create";
    },
    isPasteDisabled() {
      if (!this.isClipboardApiAvailable) {
        return !this.copyPasteConnectionString?.length;
      }
      return false;
    },
    isClipboardApiAvailable() {
      return navigator.clipboard;
    },
    avatarInitials() {
      if (this.formData) {
        return generateInitials(this.formData?.printerName);
      }
      return "?";
    },
    printerNameRules() {
      return { required: true, max: this.appConstants.maxPrinterNameLength };
    },
    apiKeyRules() {
      return {
        required: true,
        length: this.appConstants.apiKeyLength,
        alpha_num: true,
      };
    },
  },
  methods: {
    resetForm() {
      this.formData = getDefaultCreatePrinter();
    },
    async quickCopyConnectionString() {
      const printer = this.storedPrinter;
      if (!printer) return;
      const loginDetails = await PrintersService.getPrinterLoginDetails(printer.id);
      const connectionString = `{"printerURL": "${loginDetails.printerURL}", "apiKey": "${loginDetails.apiKey}", "printerName": "${printer.printerName}"}`;

      if (!this.isClipboardApiAvailable) {
        this.copyPasteConnectionString = connectionString;
        return;
      }

      // Likely happens in Firefox
      if (!navigator.clipboard) {
        throw new Error(
          `Clipboard API is not available. Secure context: ${window.isSecureContext}`
        );
      }
      await navigator.clipboard.writeText(connectionString);
    },
    openTestPanel() {
      this.showChecksPanel = true;
    },
    async testPrinter() {
      if (!(await this.isValid())) return;
      if (!this.formData) return;

      const testPrinter = PrintersService.convertCreateFormToPrinter(this.formData);
      if (!testPrinter) return;
      this.openTestPanel();

      this.testPrinterStore.clearEvents();
      const { correlationToken } = await this.testPrinterStore.createTestPrinter(testPrinter);
      this.testPrinterStore.currentCorrelationToken = correlationToken;
    },
    async pasteFromClipboardOrField() {
      if (!this.formData) return;

      if (!this.isClipboardApiAvailable && !this.copyPasteConnectionString?.length) {
        return;
      }

      const jsonData = this.isClipboardApiAvailable
        ? await navigator.clipboard.readText()
        : this.copyPasteConnectionString;
      const printerObject = JSON.parse(jsonData);

      PrintersService.applyLoginDetailsPatchForm(printerObject, this.formData);
    },
    async isValid() {
      return await this.validationObserver.validate();
    },
    async createPrinter(newPrinterData: CreatePrinter) {
      await this.printersStore.createPrinter(newPrinterData);
      this.snackbar.openInfoMessage({
        title: `Printer ${newPrinterData.printerName} created`,
      });
    },
    async updatePrinter(updatedPrinter: CreatePrinter) {
      const printerId = updatedPrinter.id;

      await this.printersStore.updatePrinter({
        printerId: printerId as string,
        updatedPrinter,
      });

      this.snackbar.openInfoMessage({
        title: `Printer ${updatedPrinter.printerName} updated`,
      });
    },
    async submit() {
      if (!(await this.isValid())) return;
      if (!this.formData) return;
      const createPrinter = PrintersService.convertCreateFormToPrinter(this.formData);
      if (this.isUpdating) {
        await this.updatePrinter(createPrinter);
      } else {
        await this.createPrinter(createPrinter);
      }
      this.closeDialog();
    },
    async duplicatePrinter() {
      this.formData.printerName = newRandomNamePair();
      this.formData.apiKey = "";
      this.printersStore.updateDialogPrinter = undefined;
    },
    closeDialog() {
      this.dialog.closeDialog();
      this.showChecksPanel = false;
      this.testPrinterStore.clearEvents();
      this.resetForm();
      this.printersStore.updateDialogPrinter = undefined;
      this.copyPasteConnectionString = "";
    },
  },
  watch: {
    [watchedId](val?: string) {
      if (!val) return;
      const printer = this.printersStore.printer(val) as CreatePrinter;
      this.formData = PrintersService.convertPrinterToCreateForm(printer);
    },
  },
});
</script>
