<template>
  <v-dialog v-model="showingDialog" :max-width="showChecksPanel ? '700px' : '600px'" persistent>
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials() }}
            </v-avatar>
            New Printer
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="showChecksPanel ? 8 : 12">
              <PrinterCrudForm ref="printerCrudForm"/>
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
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Create</v-btn>
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
import PrinterChecksPanel from "@/components/Dialogs/PrinterChecksPanel.vue";
import {usePrintersStore} from "@/stores/printers";
import type PrinterCrudForm from "@/components/Forms/PrinterCrudForm.vue";
import {computed, ref, watch} from "vue";
import {onMounted} from "@vue/runtime-core";

const printersStore = usePrintersStore();
const showingDialog = ref(false);
const testProgress?:TestProgressDetails = undefined;
const showChecksPanel = ref(false);
const printerCrudForm = ref<InstanceType<typeof PrinterCrudForm>>();
const dialogOpenedState = computed(() => printersStore.createDialogOpened);

watch(dialogOpenedState, (newValue: boolean | undefined) => {
  showingDialog.value = newValue || false;
});

function formData() {
  return $refs.printerCrudForm?.formData;
}

onMounted(() => async () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeDialog();
    }
  });
});

function avatarInitials() {
  const formData = formData();
  if (formData && showingDialog) {
    return generateInitials(formData.printerName);
  }
}

async function isValid() {
  return await $refs.validationObserver.validate();
}

function openTestPanel() {
  showChecksPanel.value = true;
  testProgress.value = undefined;
}

async function onTestPrinterUpdate(payload: PrinterSseMessage) {
  testProgress.value = payload.testProgress;
}

async function testPrinter() {
  if (!(await isValid())) return;

  showChecksPanel.value = true;
  testProgress.value = undefined;

  const formData = formData();
  if (!formData) return;
  const testPrinter = PrintersService.convertCreateFormToPrinter(formData);

  const result: Printer = await printersStore.createTestPrinter(testPrinter);
  if (!result.correlationToken) throw new Error("Test Printer CorrelationToken was empty.");

  // TODO bus
  // this.$bus.on(sseTestPrinterUpdate(result.correlationToken), this.onTestPrinterUpdate);
}

async function submit() {
  if (!(await isValid())) return;

  const formData = formData();
  if (!formData) return;
  const newPrinterData = PrintersService.convertCreateFormToPrinter(formData);

  await printersStore.createPrinter(newPrinterData);

  // TODO bus
  // this.$bus.emit(infoMessageEvent, `Printer ${newPrinterData.printerName} created`);

  closeDialog();
}

function closeDialog() {
  printersStore.setCreateDialogOpened(false);
}

</script>
