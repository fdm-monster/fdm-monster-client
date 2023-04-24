<template>
  <v-btn class="ma-2" color="primary" fab small @click.prevent.stop="deletePrinter()">
    <v-icon>delete</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Printer } from "@/models/printers/printer.model";
import { usePrintersStore } from "@/store/printers.store";

export default defineComponent({
  name: "PrinterDeleteAction",
  components: {},
  setup: () => {
    return {
      printersStore: usePrintersStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {
    printer: Object as PropType<Printer>,
  },
  computed: {
    printerId() {
      return this.printer!.id;
    },
  },
  methods: {
    async deletePrinter() {
      if (!confirm("Are you sure to delete this printer?")) return;
      await this.printersStore.deletePrinter(this.printerId);
    },
  },
});
</script>
