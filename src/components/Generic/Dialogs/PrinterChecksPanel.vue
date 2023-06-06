<template>
  <v-col :cols="cols">
    <strong>Checks:</strong>
    <v-alert v-for="(item, index) of getEvents()" :key="index" dense :type="item.color">
      <small>{{ item.label }} {{ item.text }}</small>
    </v-alert>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTestPrinterStore } from "../../../store/test-printer.store";

interface Data {
  cols: 4;
}

const errorCol = "error";
const successCol = "success";

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
  computed: {},
  methods: {
    getEvents() {
      return this.testPrinterStore.getEvents().map((e) => {
        let color = e.failure ? errorCol : successCol;
        const label = e.event;
        let text = e.payload;
        if (text === "authFail") {
          color = errorCol;
          text = "authentication failed";
        }

        return {
          label,
          text,
          color,
        };
      });
    },
  },
});
</script>
