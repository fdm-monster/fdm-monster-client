<template>
  <BaseDialog :id="dialog.dialogId" :max-width="'700px'" @escape="closeDialog()">
    <validation-observer ref="validationObserver" v-slot="{ invalid }">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56">
              {{ avatarInitials }}
            </v-avatar>
            New Printer Floor
          </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col :cols="12">
              <v-container>
                <v-row>
                  <v-col v-if="formData" cols="12" md="6">
                    <validation-provider
                      v-slot="{ errors }"
                      :rules="printerFloorNameRules"
                      name="Name"
                    >
                      <v-text-field
                        v-model="formData.name"
                        :error-messages="errors"
                        autofocus
                        label="Floor name*"
                        required
                      />
                    </validation-provider>

                    <validation-provider
                      v-slot="{ errors }"
                      :rules="floorNumberRules"
                      name="FloorNumber"
                    >
                      <v-text-field
                        v-model="formData.floor"
                        :error-messages="errors"
                        label="Floor number"
                        required
                        type="number"
                      />
                    </validation-provider>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <em class="red--text">* indicates required field</em>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog.closeDialog()">Close</v-btn>
          <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </validation-observer>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { generateInitials, newRandomNamePair } from "../../../shared/noun-adjectives.data";
import { usePrinterStore } from "../../../store/printer.store";
import { FloorService } from "../../../backend/floor.service";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useFloorStore } from "../../../store/floor.store";
import { useDialog } from "../../../shared/dialog.composable";
import { AppConstants } from "../../../shared/app.constants";
import { getDefaultCreateFloor, PreCreateFloor } from "../../../models/floors/floor.model";
import { useSnackbar } from "../../../shared/snackbar.composable";

const watchedId = "printerFloorId";

interface Data {
  formData: PreCreateFloor;
}

export default defineComponent({
  name: "AddOrUpdateFloorDialog",
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  setup: () => {
    const dialog = useDialog(DialogName.AddOrUpdateFloorDialog);
    return {
      dialog,
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
      dialogsStore: useDialogsStore(),
      appConstants: inject("appConstants") as AppConstants,
      snackbar: useSnackbar(),
    };
  },
  async created() {
    if (this.printerFloorId) {
      const crudeData = this.floorStore.floor(this.printerFloorId);
      this.formData = FloorService.convertPrinterFloorToCreateForm(crudeData);
    } else if (this.floorStore.floors?.length) {
      const maxIndex = Math.max(...this.floorStore.floors.map((pf) => pf.floor)) + 1;
      this.formData.floor = maxIndex.toString();
    }
  },
  async mounted() {},
  props: {},
  data: () => ({
    formData: getDefaultCreateFloor(),
  }),
  computed: {
    printerFloorId() {
      return this.dialog.context()?.printerFloorId;
    },
    validationObserver() {
      return this.$refs.validationObserver as InstanceType<typeof ValidationObserver>;
    },
    printerFloorNameRules() {
      return { required: true, min: this.appConstants.minPrinterFloorNameLength };
    },
    floorNumberRules() {
      return {
        required: true,
        integer: true,
      };
    },
    avatarInitials() {
      const formData = this.formData;
      if (formData) {
        return generateInitials(formData.name);
      }
      return "";
    },
  },
  methods: {
    async isValid() {
      return await this.validationObserver.validate();
    },
    async submit() {
      if (!(await this.isValid())) return;
      const formData = this.formData;
      if (!formData) return;
      const floorData = FloorService.convertCreateFormToFloor(formData);
      await this.floorStore.createFloor(floorData);

      this.snackbar.openInfoMessage(`Printer floor ${floorData.name} created`);
      formData.name = newRandomNamePair();
      const maxIndex = Math.max(...this.floorStore.floors.map((f) => f.floor)) + 1;
      formData.floor = maxIndex.toString();
      this.closeDialog();
    },
    closeDialog() {
      this.dialog.closeDialog();
    },
  },
  watch: {
    [watchedId](val?: string) {
      if (!val) return;
      const printerFloor = this.floorStore.floor(val);
      this.formData = FloorService.convertPrinterFloorToCreateForm(printerFloor);
    },
  },
});
</script>
