<template>
  <BaseDialog :id="dialogId" :max-width="showChecksPanel ? '700px' : '600px'">
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card v-if="storedUpdatedPrinter">
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials() }}
            </v-avatar>
            Updating Printer
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="showChecksPanel ? 8 : 12">
              <PrinterCrudForm ref="printerUpdateForm" :printer-id="storedUpdatedPrinter.id" />
            </v-col>

            <PrinterChecksPanel v-if="showChecksPanel" :cols="4">
              <v-btn @click="showChecksPanel = false">Hide checks</v-btn>
            </PrinterChecksPanel>
          </v-row>
          <v-row>
            <v-col v-if="!isClipboardApiAvailable()" cols="12">
              Clipboard is not available. Copy or paste the following:
              <br />
              <v-textarea v-model="copyPasteConnectionString" rows="3"></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn :disabled="invalid" color="gray" text @click="quickCopyConnectionString()">
            Copy
          </v-btn>
          <v-btn :disabled="invalid" color="warning" text @click="testPrinter()">
            Test connection
          </v-btn>
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ValidationObserver } from "vee-validate";
import { Printer } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend";
import { generateInitials } from "@/constants/noun-adjectives.data";
import PrinterChecksPanel from "@/components/Generic/Dialogs/PrinterChecksPanel.vue";
import PrinterCrudForm from "@/components/Generic/Forms/PrinterCrudForm.vue";
import { infoMessageEvent } from "../../../shared/alert.events";
import { usePrinterStore } from "../../../store/printer.store";
import { WithDialog } from "@/utils/dialog.utils";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialogsStore } from "@/store/dialog.store";
import { useTestPrinterStore } from "../../../store/test-printer.store";

interface Data extends WithDialog {
  showChecksPanel: boolean;
  copyPasteConnectionString: string;
}

export default defineComponent({
  name: "UpdatePrinterDialog",
  components: {
    ValidationObserver,
    PrinterCrudForm,
    PrinterChecksPanel,
  },
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      testPrinterStore: useTestPrinterStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    dialogId: DialogName.UpdatePrinterDialog,
    showChecksPanel: false,
    copyPasteConnectionString: "",
  }),
  computed: {
    validationObserver() {
      return this.$refs.validationObserver as InstanceType<typeof ValidationObserver>;
    },
    storedUpdatedPrinter() {
      return this.printersStore.updateDialogPrinter;
    },
  },
  methods: {
    printerUpdateForm() {
      return this.$refs.printerUpdateForm as InstanceType<typeof PrinterCrudForm>;
    },
    clipboardPasteField() {
      return this.$refs.clipboardPasteField as InstanceType<typeof HTMLFormElement>;
    },
    formData() {
      return this.printerUpdateForm()?.formData;
    },
    avatarInitials() {
      if (this.formData()) {
        return generateInitials(this.formData()?.printerName);
      }
      return "";
    },
    openTestPanel() {
      this.showChecksPanel = true;
    },
    async isValid() {
      return await this.validationObserver.validate();
    },
    async testPrinter() {
      if (!(await this.isValid())) return;
      const formData = this.formData();
      if (!formData) return;

      const testPrinter = PrintersService.convertCreateFormToPrinter(formData);
      if (!testPrinter) return;
      this.openTestPanel();

      await this.testPrinterStore.createTestPrinter(testPrinter);
      // const result: Printer =
      // if (!result.correlationToken) throw new Error("Test Printer CorrelationToken was empty.");
      // socketIoTestPrinterUpdate(result.correlationToken)
      // this.$bus.on("test-printer-state", this.onTestPrinterUpdate);
    },
    isClipboardApiAvailable() {
      return navigator.clipboard;
    },
    async quickCopyConnectionString() {
      const printer = this.storedUpdatedPrinter;
      if (!printer) return;
      const loginDetails = await PrintersService.getPrinterLoginDetails(printer.id);
      const connectionString = `{"printerURL": "${loginDetails.printerURL}", "apiKey": "${loginDetails.apiKey}", "printerName": "${printer.printerName}"}`;

      if (!this.isClipboardApiAvailable()) {
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
    async submit() {
      if (!(await this.isValid())) return;
      const formData = this.formData();
      if (!formData) return;

      const updatedPrinter = PrintersService.convertCreateFormToPrinter(formData);
      const printerId = updatedPrinter.id;

      const updatedData = await this.printersStore.updatePrinter({
        printerId: printerId as string,
        updatedPrinter,
      });

      this.$bus.emit(infoMessageEvent, `Printer ${updatedPrinter.printerName} updated`);

      this.closeDialog();
    },
    closeDialog() {
      this.dialogsStore.closeDialog(this.dialogId);
      this.printersStore.setUpdateDialogPrinter(undefined);
      this.copyPasteConnectionString = "";
    },
  },
  watch: {
    async storedUpdatedPrinter(viewedPrinter?: Printer) {
      const printerId = viewedPrinter?.id;

      if (!viewedPrinter) {
        this.printersStore.setUpdateDialogPrinter(undefined);
      }

      if (!viewedPrinter || !printerId) return;

      const loginDetails = await PrintersService.getPrinterLoginDetails(printerId);
      const formData = this.formData();
      if (formData) formData.apiKey = loginDetails.apiKey;
    },
  },
});
</script>
