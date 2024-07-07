<template>
  <v-btn color="secondary" @click="getFiles()">
    <v-icon>refresh</v-icon>
    <span class="d-none d-lg-inline">Refresh files</span>
  </v-btn>
</template>

<script lang="ts">
import { usePrinterStore } from "@/store/printer.store";
import { defineComponent, PropType } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";

interface Data {
  property: number;
}

export default defineComponent({
  name: "RefreshFilesAction",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {
    printer: Object as PropType<PrinterDto>,
  },
  data: (): Data => ({
    property: 0,
  }),
  computed: {},
  methods: {
    async getFiles() {
      if (!this.printer) return;

      await this.printersStore.loadPrinterFiles(this.printer.id);
    },
  },
  watch: {},
});
</script>
