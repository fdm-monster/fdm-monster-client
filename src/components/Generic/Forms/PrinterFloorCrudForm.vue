<template>
  <v-container>
    <v-row>
      <v-col v-if="formData" cols="12" md="6">
        <validation-provider v-slot="{ errors }" :rules="printerFloorNameRules" name="Name">
          <v-text-field
            v-model="formData.name"
            :error-messages="errors"
            autofocus
            label="Floor name*"
            required
          />
        </validation-provider>

        <validation-provider v-slot="{ errors }" :rules="floorNumberRules" name="FloorNumber">
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
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { ValidationProvider } from "vee-validate";
import { AppConstants } from "@/constants/app.constants";
import {
  getDefaultCreateFloor,
  PreCreateFloor,
} from "../../../models/floors/floor.model";
import { FloorService } from "../../../backend/floor.service";
import { usePrinterStore } from "../../../store/printer.store";
import { useFloorStore } from "../../../store/floor.store";

const watchedId = "printerFloorId";

interface Data {
  formData: PreCreateFloor;
}

export default defineComponent({
  name: "PrinterFloorCrudForm",
  components: {
    ValidationProvider,
  },
  setup: () => {
    return {
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
      appConstants: inject("appConstants") as AppConstants,
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
  props: {
    printerFloorId: String,
  },
  data: (): Data => ({
    formData: getDefaultCreateFloor(),
  }),
  computed: {
    printerFloorNameRules() {
      return { required: true, min: this.appConstants.minPrinterFloorNameLength };
    },
    floorNumberRules() {
      return {
        required: true,
        integer: true,
      };
    },
  },
  methods: {},
  watch: {
    [watchedId](val?: string) {
      if (!val) return;
      const printerFloor = this.floorStore.floor(val);
      this.formData = FloorService.convertPrinterFloorToCreateForm(printerFloor);
    },
  },
});
</script>
