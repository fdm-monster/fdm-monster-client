<template>
  <v-dialog
    :value="showingDialog"
    :max-width="maxWidth"
    :retain-focus="false"
    persistent
    @close="emitEscape()"
  >
    <slot></slot>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { usePrinterStore } from "../../../store/printer.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "../../../shared/dialog.composable";
import { onKeyStroke } from "@vueuse/core";

export default defineComponent({
  name: "BaseDialog",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {
    onKeyStroke("Escape", (e) => {
      if (this.showingDialog) {
        e.preventDefault();
        this.emitEscape();
      }
    });
  },
  async mounted() {
    this.dialogsStore.registerDialogReference(this.id);
  },
  beforeDestroy() {
    this.dialogsStore.unregisterDialogReference(this.id);
  },
  props: {
    id: {
      type: String as () => DialogName,
      required: true,
    },
    maxWidth: {
      type: String,
      default: "400px",
    },
  },
  computed: {
    dialog() {
      return this.id ? this.dialogsStore.dialogsById[this.id] : undefined;
    },
    showingDialog() {
      if (!this.id) return;

      console.log(`[BaseDialog ${this.id}] Showing dialog: ${this.dialog?.opened}`);
      return this.dialogsStore.isDialogOpened(this.id);
    },
  },
  methods: {
    emitEscape() {
      this.$emit("escape");
    },
  },
  watch: {},
});
</script>
