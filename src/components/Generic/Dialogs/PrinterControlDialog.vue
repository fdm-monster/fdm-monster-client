<template>
  <BaseDialog :id="dialog.dialogId" :max-width="'700px'" @escape="closeDialog()">
    <v-card>
      <v-card-title> Printer Controls</v-card-title>
      <v-card-text>
        <v-container v-if="printer">
          <v-row>
            <v-col :cols="12">
              Printer: {{ printer?.name }}
              <br />
              <v-chip color="primary">
                {{ printerTemps?.actual }}C / {{ printerTemps?.target }}C
              </v-chip>
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="8">
              X/Y
              <br />
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(-1, 1, 0)">
                <v-icon>north_west</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(0, 1, 0)">
                <v-icon>north</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(1, 1, 0)">
                <v-icon>north_east</v-icon>
              </v-btn>
              <br />
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(-1, 0, 0)">
                <v-icon>west</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="homeAxes(['x', 'y'])">
                <v-icon>home</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(1, 0, 0)">
                <v-icon>east</v-icon>
              </v-btn>
              <br />
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(-1, -1, 0)">
                <v-icon>south_west</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(0, -1, 0)">
                <v-icon>south</v-icon>
              </v-btn>
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(1, -1, 0)">
                <v-icon>south_east</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4">
              Z
              <br />
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(0, 0, 1)">
                <v-icon>north</v-icon>
              </v-btn>
              <br />
              <v-btn class="primary" outlined x-large @click="homeAxes(['z'])">
                <v-icon>home</v-icon>
              </v-btn>
              <br />
              <v-btn class="primary" outlined x-large @click="jogPrinterHead(1, 0, 1)">
                <v-icon>south</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-btn-toggle v-model="multiplier">
                <v-btn :value="0.1">0.1</v-btn>
                <v-btn :value="1">1</v-btn>
                <v-btn :value="10">10</v-btn>
                <v-btn :value="100">100</v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { useDialog } from "@/shared/dialog.composable";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { computed, ref } from "vue";
import { usePrinterStore } from "@/store/printer.store";
import { IdType } from "@/utils/id.type";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { PrintersService } from "@/backend";

const dialog = useDialog<{ printerId: IdType }>(DialogName.PrinterControlDialog);
const printerStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();
const printerId = computed(() => dialog.context()?.printerId);
const printer = computed(() => {
  if (!printerId.value) return;

  return printerStore.printer(printerId.value);
});

const multiplier = ref<number>(10);

const printerTemps = computed(() => {
  const events = printerStateStore.printerEventsById[printerId.value];
  if (
    events?.current?.payload?.temps?.length &&
    events?.current?.payload?.temps[0]?.tool0?.actual
  ) {
    return events?.current?.payload?.temps[0]?.tool0;
  }
  return null;
});

const jogPrinterHead = async (x: number, y: number, z: number) => {
  await PrintersService.sendPrinterJogCommand(printerId.value, {
    x: x * multiplier.value,
    y: y * multiplier.value,
    z: z * multiplier.value,
  });
};

const homeAxes = async (axes: string[]) => {
  await PrintersService.sendPrinterHomeCommand(printerId.value, axes);
};

const closeDialog = () => {
  dialog.closeDialog();
};
</script>
