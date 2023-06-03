<template>
  <v-col :cols="cols">
    <strong>Checks:</strong>
    <v-alert type="success" v-for="(item, index) of testPrinterStore.getEvents()" :key="index">
      <small>{{ item.event }} {{ item.payload }}</small>
    </v-alert>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTestPrinterStore } from "../../../store/test-printer.store";

interface Data {
  cols: 4;
}

export default defineComponent({
  name: "PrinterChecksPanel",
  components: {},
  setup: () => {
    return {
      testPrinterStore: useTestPrinterStore(),
    };
  },
  data: (): Data => ({
    cols: 4,
  }),
  computed: {
    getEvents() {
      return this.testPrinterStore.getEvents();
    },
  },
  methods: {
    isSet(value: boolean) {
      return value === false || value === true;
    },
  },
});
</script>
