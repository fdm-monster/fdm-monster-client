<template>
  <v-container>
    <v-row>
      <v-col v-if="formData" cols="12" md="6">
        <v-text-field
          v-model="formData.name"
          :counter="printerGroupNameRules.max"
          label="Printer name*"
          required
        />

        <v-text-field
          v-model="formData.location.x"
          :counter="locationXRules.max"
          label="Location X"
          required
          type="number"
        />

        <v-text-field
          v-model="formData.location.y"
          :counter="locationYRules.max"
          label="Location Y*"
          required
          type="number"
        />

        <!--        Maybe we'll add this in future -->
        <!--          <v-select-->
        <!--            v-model="formData.printers"-->
        <!--            :items="printersWithoutGroup"-->
        <!--            label="Printers"-->
        <!--            multiple-->
        <!--            no-data-text="No printers without group"-->
        <!--            required-->
        <!--          ></v-select>-->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { AppConstants } from "@/shared/app.constants";
import { PrinterGroupService } from "@/backend";
import {
  getDefaultCreatePrinterGroup,
  type PreCreatePrinterGroup,
} from "@/models/crud/create-printer-group.model";
import type { PrinterGroup } from "@/models/printers/printer-group.model";
import type { Printer } from "@/models/printers/printer.model";

const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();
const appConstants = inject(AppConstants)!;
const { printerGroupId } = defineProps<{ printerGroupId: string }>();
let printersWithoutGroup: Printer[];
let formData: PreCreatePrinterGroup = getDefaultCreatePrinterGroup();
const printerGroupNames = computed(() => printerGroupsStore.printerGroupNames);
const printerGroupNameRules = computed(() => {
  return { required: true, max: appConstants.maxPrinterGroupNameLength };
});
const locationXRules = computed(() => ({
  required: true,
  integer: true,
  max: appConstants.maxPrinterGroupLocationX,
}));
const locationYRules = computed(() => ({
  required: true,
  integer: true,
  max: appConstants.maxPrinterGroupLocationY,
}));

onMounted(async () => {
  if (printerGroupId) {
    const crudeData = printerGroupsStore.printerGroup(printerGroupId);
    if (!crudeData) return;
    formData = PrinterGroupService.convertPrinterGroupToCreateForm(crudeData);
  }
  await printerGroupsStore.loadPrinterGroups();
});

watch(
  () => printerGroupId,
  (val?: string) => {
    if (!val) return;
    const printerGroup = printerGroupsStore.printerGroup(val) as PrinterGroup;
    formData =
      PrinterGroupService.convertPrinterGroupToCreateForm(printerGroup);
  }
);
</script>
