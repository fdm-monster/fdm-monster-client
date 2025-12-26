<template>
  <BaseDialog :id="dialogId" max-width="800px" @escape="closeDialog()">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">data_object</v-icon>
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn icon small @click="copyToClipboard">
          <v-icon small>content_copy</v-icon>
        </v-btn>
        <v-btn icon small @click="closeDialog()">
          <v-icon small>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <pre class="json-content pa-4">{{ formattedJson }}</pre>
      </v-card-text>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import BaseDialog from "@/components/Generic/Dialogs/BaseDialog.vue";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { useSnackbar } from "@/shared/snackbar.composable";

interface JsonViewerContext {
  title?: string;
  data: unknown;
}

const dialogId = DialogName.JsonViewerDialog;
const dialog = useDialog<JsonViewerContext>(dialogId);
const snackbar = useSnackbar();

const title = computed(() => {
  const ctx = dialog.context();
  return ctx?.title || "JSON Viewer";
});

const formattedJson = computed(() => {
  const ctx = dialog.context();
  if (!ctx?.data) return "No data";
  try {
    return JSON.stringify(ctx.data, null, 2);
  } catch {
    return String(ctx.data);
  }
});

function closeDialog() {
  dialog.closeDialog();
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    snackbar.info("Copied to clipboard");
  } catch {
    snackbar.error("Failed to copy to clipboard");
  }
}
</script>

<style scoped>
.json-content {
  background-color: #1e1e1e;
  color: #9cdcfe;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow: auto;
  max-height: 70vh;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
