<template>
  <BaseDialog :id="dialog.dialogId" :max-width="'700px'" @escape="closeDialog()">
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card class="pa-4">
        <v-card-title>
          <span class="text-h5"> Mark '{{ printer?.name }}' for maintenance </span>
        </v-card-title>
        <v-alert color="secondary">Keep this info clear and stick to convention</v-alert>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedQuickItems"
                :chips="true"
                :items="quickItems"
                :menu-props="{
                  closeOnClick: true,
                  closeOnContentClick: true,
                }"
                clearable
                color="primary"
                multiple
                placeholder="Quick select reason"
                @change="updateText()"
              ></v-select>
              <validation-provider v-slot="{ errors }" name="JSON" rules="required">
                <v-textarea
                  v-model="formData.disabledReason"
                  :error-messages="errors"
                  data-vv-validate-on="change|blur"
                >
                  <template v-slot:label>
                    <div>Type the reason*</div>
                  </template>
                </v-textarea>
              </validation-provider>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { PrintersService } from "@/backend";
import { usePrinterStore } from "@/store/printer.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialogsStore } from "@/store/dialog.store";
import { useDialog } from "@/shared/dialog.composable";

interface Data {
  selectedQuickItems: string[];
  quickItems: string[];
  formData: any;
}

const selectedQuickItems = ref([]);
const quickItems = [
  "Broken part",
  "Blob",
  "Maxtemp",
  "Preheat error",
  "Cable USB ",
  "Bed thermal runaway",
  "Thermistor Heatbed",
  "Thermistor Heatblock",
  "Thermal Runaway",
  "Mintemp Nozzle",
  "Mintemp Heatbed",
  "Nozzle",
  "Nozzle Clog",
  "Fan Hotend",
  "Fan Part cooling",
  "Extruder rattle",
  "Extruder",
  "Z Axis",
  "X Axis",
  "Y Axis",
  "Rented",
  "Motherboard",
  "Other",
  "Clean",
];
const formData = ref<{
  disabledReason?: string;
}>({});
const printersStore = usePrinterStore();
const dialogsStore = useDialogsStore();
const dialog = useDialog(DialogName.PrinterMaintenanceDialog);

const validationObserver = ref(null);
const printer = computed(() => printersStore.maintenanceDialogPrinter);

const isValid = async () => {
  return await validationObserver.value.validate();
};

const updateText = () => {
  formData.value.disabledReason = selectedQuickItems.value.join(", ");
};

const submit = async () => {
  if (!(await isValid())) return;

  const printerId = printer.value?.id;
  if (!printerId) {
    formData.value = {};
    closeDialog();
    return;
  }

  const disabledReason = formData.value.disabledReason;
  await PrintersService.updatePrinterMaintenance(printerId, disabledReason);

  formData.value = {};
  closeDialog();
};

const closeDialog = () => {
  selectedQuickItems.value = [];
  dialog.closeDialog();
  printersStore.setMaintenanceDialogPrinter();
};
</script>
