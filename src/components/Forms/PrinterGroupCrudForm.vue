<template>
  <v-container>
    <v-row>
      <v-col v-if="formData" cols="12" md="6">
        <validation-provider v-slot="{ errors }" :rules="printerGroupNameRules" name="Name">
          <v-text-field
              v-model="formData.name"
              :counter="printerGroupNameRules.max"
              :error-messages="errors"
              label="Printer name*"
              required
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" :rules="locationXRules" name="LocationX">
          <v-text-field
              v-model="formData.location.x"
              :counter="locationXRules.max"
              :error-messages="errors"
              label="Location X"
              required
              type="number"
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" :rules="locationYRules" name="LocationY">
          <v-text-field
              v-model="formData.location.y"
              :counter="locationYRules.max"
              :error-messages="errors"
              label="Location Y*"
              required
              type="number"
          />
        </validation-provider>

        <!--        Maybe we'll add this in future -->
        <!--        <validation-provider v-slot="{ errors }" name="Groups">-->
        <!--          <v-select-->
        <!--            v-model="formData.printers"-->
        <!--            :error-messages="errors"-->
        <!--            :items="printersWithoutGroup"-->
        <!--            label="Printers"-->
        <!--            multiple-->
        <!--            no-data-text="No printers without group"-->
        <!--            required-->
        <!--          ></v-select>-->
        <!--        </validation-provider>-->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {computed, inject, watch} from "vue";
import {AppConstants} from "@/constants/app.constants";
import {usePrintersStore} from "@/stores/printers";
import {PrinterGroupService} from "@/backend";
import {
  getDefaultCreatePrinterGroup,
  type PreCreatePrinterGroup
} from "@/models/printer-groups/crud/create-printer-group.model";
import type {PrinterGroup} from "@/models/printers/printer-group.model";
import type {Printer} from "@/models/printers/printer.model";
import {usePrinterGroupsStore} from "@/stores/printer-groups";
import {onMounted} from "@vue/runtime-core";

const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();
const appConstants = inject(AppConstants)!;
const {printerGroupId} = defineProps<{ printerGroupId: string }>();
let printersWithoutGroup: Printer[];
let formData: PreCreatePrinterGroup = getDefaultCreatePrinterGroup();
const printerGroupNames = computed(() => printerGroupsStore.printerGroupNames);
const printerGroupNameRules = computed(() => {
  return {required: true, max: appConstants.maxPrinterGroupNameLength};
});
const locationXRules = computed(() => ({
      required: true,
      integer: true,
      max: appConstants.maxPrinterGroupLocationX
    })
);
const locationYRules = computed(() => ({
      required: true,
      integer: true,
      max: appConstants.maxPrinterGroupLocationY
    })
);

onMounted(async () => {
  if (printerGroupId) {
    const crudeData = printerGroupsStore.printerGroup(printerGroupId);
    if (!crudeData) return;
    formData = PrinterGroupService.convertPrinterGroupToCreateForm(crudeData);
  }
  await printerGroupsStore.loadPrinterGroups();
});

watch(() => printerGroupId, (val?: string) => {
  if (!val) return;
  const printerGroup = printerGroupsStore.printerGroup(val) as PrinterGroup;
  formData = PrinterGroupService.convertPrinterGroupToCreateForm(printerGroup);
});
</script>
