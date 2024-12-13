<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn fab small @click.c.capture.native.stop="openSettings()" v-bind="attrs" v-on="on">
        <v-icon>settings</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>Update printer settings</template>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";

export default defineComponent({
  name: "PrinterSettingsAction",
  props: {
    printer: Object as PropType<PrinterDto>,
  },
  computed: {
    printerId() {
      return this.printer!.id;
    },
  },
  methods: {
    openSettings() {
      this.$emit("update:show", this.printer!.id);
    },
  },
});
</script>
