<template>
  <v-dialog v-model="showingDialog" :max-width="'700px'" persistent>
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials() }}
            </v-avatar>
            New Printer Group
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="12">
              <PrinterGroupCrudForm ref="printerGroupCrudForm"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <!--          Might be used later if problems arise-->
          <!--          <v-btn :disabled="invalid" color="warning" text @click="validateGroup()">-->
          <!--            Validate-->
          <!--          </v-btn>-->
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </v-dialog>
</template>

<script lang="ts" setup>
import {computed, watch} from "vue";
import {PrinterGroupService} from "@/backend";
import {generateInitials} from "@/constants/noun-adjectives.data";
import {usePrintersStore} from "@/stores/printers";
import {infoMessageEvent} from "@/event-bus/alert.events";
import type PrinterGroupCrudForm from "@/components/Forms/PrinterGroupCrudForm.vue";
import {usePrinterGroupsStore} from "@/stores/printer-groups";
import {onMounted} from "@vue/runtime-core";

let showingDialog = false;
let showChecksPanel = false;
const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();
const printerGroupCrudForm: InstanceType<typeof PrinterGroupCrudForm>;

const dialogOpenedState = computed(() =>
    printerGroupsStore.createGroupDialogOpened
);
watch(dialogOpenedState, (newValue?: boolean) => {
  showingDialog = newValue ?? false;
});

function formData() {
  return $refs.printerGroupCrudForm?.formData;
}

onMounted(async () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeDialog();
    }
  });
});

function avatarInitials() {
  const formData = this.formData();
  if (formData && this.showingDialog) {
    return generateInitials(formData.name);
  }
}

async function isValid() {
  return await $refs.validationObserver.validate();
}

async function submit() {
  if (!(await isValid())) return;

  const formData = this.formData();
  if (!formData) return;
  const newPrinterGroupData = PrinterGroupService.convertCreateFormToPrinterGroup(formData);

  await printerGroupsStore.createPrinterGroup(newPrinterGroupData);

  // TODO bus
  // $bus.emit(infoMessageEvent, `Printer ${newPrinterGroupData.name} created`);

  closeDialog();
}

function closeDialog() {
  printerGroupsStore.setCreateGroupDialogOpened(false);
}
</script>
