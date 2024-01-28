<template>
  <v-dialog
    :max-width="maxWidth"
    :retain-focus="false"
    :value="showingDialog"
    persistent
    @close="emitEscape()"
  >
    <slot></slot>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { onKeyStroke } from "@vueuse/core";
import { useDialog } from "@/shared/dialog.composable";

const props = defineProps({
  id: {
    type: String as () => DialogName,
    required: true,
  },
  maxWidth: {
    type: String,
    default: "400px",
  },
});
const dialogsStore = useDialogsStore();
const emit = defineEmits(["escape", "opened", "beforeOpened"]);
const dialog = useDialog(props.id);

function openedCallback(input: any) {
  return emit("opened", input);
}

function beforeOpenedCallback(input: any) {
  return emit("beforeOpened", input);
}

onMounted(async () => {
  onKeyStroke("Escape", (e) => {
    if (showingDialog.value) {
      e.preventDefault();
      emitEscape();
    }
  });
  dialogsStore.registerDialogReference(props.id, {
    beforeOpenedCallback,
    openedCallback,
  });
});

onBeforeUnmount(() => {
  dialogsStore.unregisterDialogReference(props.id);
});

const showingDialog = computed(() => {
  if (!props.id) return;

  const isOpened = dialogsStore.isDialogOpened(props.id);
  if (isOpened) {
    console.debug(`[BaseDialog ${props.id}] Showing dialog: ${dialog?.isDialogOpened()}`);
  }
  return isOpened;
});

function emitEscape() {
  emit("escape");
}
</script>
