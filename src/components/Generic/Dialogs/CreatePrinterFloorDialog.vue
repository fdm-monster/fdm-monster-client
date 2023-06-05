<template>
  <BaseDialog :id="dialogId" :max-width="'700px'">
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials() }}
            </v-avatar>
            New Printer Floor
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="12">
              <PrinterFloorCrudForm ref="printerFloorCrudForm" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ValidationObserver } from "vee-validate";
import { generateInitials, newRandomNamePair } from "../../../shared/noun-adjectives.data";
import { infoMessageEvent } from "../../../shared/alert.events";

import { usePrinterStore } from "../../../store/printer.store";
import PrinterFloorCrudForm from "@/components/Generic/Forms/PrinterFloorCrudForm.vue";
import { FloorService } from "../../../backend/floor.service";
import { useDialogsStore } from "@/store/dialog.store";
import { WithDialog } from "@/utils/dialog.utils";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useFloorStore } from "../../../store/floor.store";

type Data = WithDialog;

export default defineComponent({
  name: "CreatePrinterFloorDialog",
  components: {
    ValidationObserver,
    PrinterFloorCrudForm,
  },
  setup: () => {
    return {
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    dialogId: DialogName.CreatePrinterFloorDialog,
  }),
  computed: {
    validationObserver() {
      return this.$refs.validationObserver as InstanceType<typeof ValidationObserver>;
    },
  },
  methods: {
    printerFloorCrudForm() {
      return this.$refs.printerFloorCrudForm as InstanceType<typeof PrinterFloorCrudForm>;
    },
    formData() {
      return this.printerFloorCrudForm()?.formData;
    },
    avatarInitials() {
      const formData = this.formData();
      if (formData) {
        return generateInitials(formData.name);
      }
    },
    async isValid() {
      return await this.validationObserver.validate();
    },
    async submit() {
      if (!(await this.isValid())) return;
      const formData = this.formData();
      if (!formData) return;
      const floorData = FloorService.convertCreateFormToFloor(formData);
      await this.floorStore.createFloor(floorData);

      this.$bus.emit(infoMessageEvent, `Printer floor ${floorData.name} created`);
      formData.name = newRandomNamePair();
      const maxIndex = Math.max(...this.floorStore.floors.map((f) => f.floor)) + 1;
      formData.floor = maxIndex.toString();
      this.closeDialog();
    },
    closeDialog() {
      this.dialogsStore.closeDialog(this.dialogId);
    },
  },
  watch: {},
});
</script>
