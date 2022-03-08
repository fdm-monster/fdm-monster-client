<template>
  <v-dialog v-model="dialogShowed" :max-width="showChecksPanel ? '700px' : '600px'" persistent>
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
              <PrinterCrudForm ref="printerUpdateForm" :printer-id="storedUpdatedPrinter.id"/>
            </v-col>

            <PrinterChecksPanel v-if="showChecksPanel" :cols="4" :test-progress="testProgress">
              <v-btn @click="showChecksPanel = false">Hide checks</v-btn>
            </PrinterChecksPanel>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn :disabled="invalid" color="warning" text @click="testPrinter()">
            Test connection
          </v-btn>
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import type {PrinterSseMessage, TestProgressDetails} from "@/models/sse-messages/printer-sse-message.model";
import {PrintersService} from "@/backend";
import {generateInitials} from "@/constants/noun-adjectives.data";
import {updatedPrinterEvent} from "@/event-bus/printer.events";
import PrinterChecksPanel from "@/components/Dialogs/PrinterChecksPanel.vue";
import {usePrintersStore} from "@/stores/printers";
import type PrinterCrudForm from "@/components/Forms/PrinterCrudForm.vue";
import {infoMessageEvent} from "@/event-bus/alert.events";
import {computed, ref, watch} from "vue";
import {onMounted} from "@vue/runtime-core";
import {usePrinterGroupsStore} from "@/stores/printer-groups";

const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();
let dialogShowed = ref(false);
let showChecksPanel = ref(false);
let testProgress = ref<TestProgressDetails>();
const $refs!: {
  printerUpdateForm: InstanceType<typeof PrinterCrudForm>;
};

const storedUpdatedPrinter = computed(() => {
  return printersStore.updateDialogPrinter;
});

function formData() {
  return $refs.printerUpdateForm?.formData;
}

watch(storedUpdatedPrinter, (viewedPrinter?: Printer) => {
  dialogShowed.value = !!viewedPrinter;
  const printerId = viewedPrinter?.id;
  if (!viewedPrinter || !printerId) return;

  const loginDetails = await PrintersService.getPrinterLoginDetails(printerId);
  const formData = this.formData();
  if (formData) formData.apiKey = loginDetails.apiKey;
});

watch(dialogShowed, (newVal: boolean) => {
  // Due to the animation delay the nav model lags behind enough for SSE to pick up and override
  if (!newVal) {
    printersStore.setUpdateDialogPrinter(undefined);
  }
});

onMounted(async () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeDialog();
    }
  });

  await printerGroupsStore.loadPrinterGroups();
});

function avatarInitials() {
  const formData = formData();
  if (formData && dialogShowed) {
    return generateInitials(formData.printerName);
  }
}

function openTestPanel() {
  showChecksPanel.value = true;
  testProgress.value = undefined;
}

async function onTestPrinterUpdate(payload: PrinterSseMessage) {
  testProgress.value = payload.testProgress;
}

async function isValid() {
  // return await this.$refs.validationObserver.validate();
}

async function testPrinter() {
  if (!(await isValid())) return;

  const formData = formData();
  if (!formData) return;

  const testPrinter = PrintersService.convertCreateFormToPrinter(formData);
  if (!testPrinter) return;
  this.openTestPanel();

  const result: Printer = await printersStore.createTestPrinter(testPrinter);
  if (!result.correlationToken) throw new Error("Test Printer CorrelationToken was empty.");

  // TODO bus
  // this.$bus.on(sseTestPrinterUpdate(result.correlationToken), this.onTestPrinterUpdate);
}

async function submit() {
  if (!(await isValid())) return;

  const formData = formData();
  if (!formData) return;

  const updatedPrinter = PrintersService.convertCreateFormToPrinter(formData);
  const printerId = updatedPrinter.id;

  const updatedData = await printersStore.updatePrinter({
    printerId: printerId as string,
    updatedPrinter
  });

  this.$bus.emit(updatedPrinterEvent(printerId as string), updatedData);
  this.$bus.emit(infoMessageEvent, `Printer ${updatedPrinter.printerName} updated`);
}

function closeDialog() {
  printersStore.setUpdateDialogPrinter(undefined);
}

</script>
