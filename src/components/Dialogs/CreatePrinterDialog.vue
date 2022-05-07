<template>
  <v-dialog
    v-model="dialogShowed"
    :max-width="showChecksPanel ? '700px' : '600px'"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">
          <v-avatar color="primary" size="56">
            {{ avatarInitials }}
          </v-avatar>
          New Printer
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="showChecksPanel ? 8 : 12">
            <SchemaFormWithValidation
              ref="schemaFormRef"
              :schema="formLayout"
              :validation-schema="formSchema"
              @submit="submit"
            >
            </SchemaFormWithValidation>
          </v-col>

          <PrinterChecksPanel
            v-if="showChecksPanel"
            :cols="4"
            :test-progress="testProgress"
          >
            <v-btn @click="showChecksPanel = false">Hide checks</v-btn>
          </PrinterChecksPanel>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="red--text">* indicates required field</em>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">Close</v-btn>
        <v-btn :disabled="!isFormValid()" color="warning" text @click="testPrinter()">
          Test connection
        </v-btn>
        <v-btn :disabled="!isFormValid()" color="blue darken-1" text @click="submit()"
          >Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { Printer } from "@/models/printers/printer.model";
import type {
  PrinterSseMessage,
  TestProgressDetails,
} from "@/models/sse-messages/printer-sse-message.model";
import { PrintersService } from "@/backend";
import { generateInitials } from "@/shared/noun-adjectives.data";
import {
  printerCrudForm,
  type PrinterPreCreateZodType,
} from "@/models/forms/printer-crud.form";
import { useSchemaForm } from "formvuelate";
import { appErrorKey } from "@/shared/events/alert.events";
import { updatedPrinterKey } from "@/shared/events/printer.events";
import type { FormValidation } from "@/utils/types/FormValidation";
import { bindWindowEscape } from "@/utils/window-listener.utils";

export default defineComponent({
  setup: () => {
    let dialogShowed = ref(false);
    let showChecksPanel = ref(false);
    let testProgress = ref<TestProgressDetails>();

    const formInstance = printerCrudForm();
    const formData = ref<PrinterPreCreateZodType>(
      formInstance.getDefaultFormData()
    );
    useSchemaForm(formData);

    return {
      formInstance,
      formLayout: ref(formInstance.formLayout),
      formSchema: formInstance.formSchema,
      formData,
      schemaFormRef: ref(),
      appErrorEventBus: useEventBus(appErrorKey),
      printerUpdateEventBus: useEventBus(updatedPrinterKey),
      printersStore: usePrintersStore(),
      printerGroupsStore: usePrinterGroupsStore(),
      dialogShowed,
      showChecksPanel,
      testProgress,
    };
  },
  data: (): { formValidation: FormValidation | null } => ({
    formValidation: null,
  }),
  watch: {
    "schemaFormRef.slotBinds.validation.meta"() {
      this.formValidation = this.schemaFormRef?.slotBinds.validation;
    },
    async storedUpdatedPrinter(viewedPrinter?: Printer) {
      this.dialogShowed = !!viewedPrinter;
      const printerId = viewedPrinter?.id;
      if (!viewedPrinter || !printerId) return;

      const loginDetails = await PrintersService.getPrinterLoginDetails(
        printerId
      );
      const formData = this.formData;
      if (formData) formData.apiKey = loginDetails.apiKey;
    },
    dialogShowed(newVal: boolean) {
      // Due to the animation delay the nav model lags behind enough for SSE to pick up and override
      if (!newVal) {
        this.printersStore.setUpdateDialogPrinter(undefined);
      }
    },
  },
  async mounted() {
    this.validatePrinterIdSet();
    bindWindowEscape(this.closeDialog);
    await this.printerGroupsStore.loadPrinterGroups();
  },
  computed: {
    storedUpdatedPrinter() {
      return this.printersStore.updateDialogPrinter;
    },
    avatarInitials() {
      const formData = this.formData;
      if (formData && this.dialogShowed) {
        return generateInitials(formData.printerName);
      }
    },
  },
  methods: {
    isFormValid() {
      return this.formValidation?.meta?.valid;
    },
    validatePrinterIdSet() {
      const printerId = this.printersStore.updateDialogPrinter?.id;
      if (!printerId) {
        // TODO emit error
        this.closeDialog();
      }
    },
    openTestPanel() {
      this.showChecksPanel = true;
      this.testProgress = undefined;
    },
    closeDialog() {
      this.printersStore.setUpdateDialogPrinter(undefined);
    },
    async onTestPrinterUpdate(payload: PrinterSseMessage) {
      this.testProgress = payload.testProgress;
    },
    async testPrinter() {
      if (!this.isFormValid()) return;

      const formData = this.formData;
      if (!formData) return;

      const testPrinter = PrintersService.convertCreateFormToPrinter(formData);
      if (!testPrinter) return;
      this.openTestPanel();

      const result: Printer = await this.printersStore.createTestPrinter(
        testPrinter
      );
      if (!result.correlationToken)
        throw new Error("Test Printer CorrelationToken was empty.");

      // TODO bus
      // this.$bus.on(sseTestPrinterUpdate(result.correlationToken), this.onTestPrinterUpdate);
    },
    async submit() {
      if (!this.isFormValid()) return;

      const formData = this.formData;
      if (!formData) return;

      const createPrinter =
        PrintersService.convertCreateFormToPrinter(formData);

      const createdPrinterData = await this.printersStore.createPrinter(
        createPrinter
      );

      // TODO bus
      // this.$bus.emit(createdPrinterEvent, createdPrinterData);
      // this.$bus.emit(infoMessageEvent, `Printer ${createdPrinterData.printerName} updated`);

      this.closeDialog();
    },
  },
});
</script>
