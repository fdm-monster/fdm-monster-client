<template>
  <v-btn
    class="ma-2"
    color="primary"
    fab
    small
    @click.c.capture.native.stop="openCreatePrinterDialog()"
  >
    <v-icon>add</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useDialogsStore } from "../../../store/dialog.store";
import { DialogName } from "../Dialogs/dialog.constants";

export default defineComponent({
  name: "PrinterCreateAction",
  props: {},
  setup: () => {
    return {
      dialogsStore: useDialogsStore(),
    };
  },
  computed: {},
  methods: {
    openCreatePrinterDialog() {
      this.dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
    },
  },
});
</script>
