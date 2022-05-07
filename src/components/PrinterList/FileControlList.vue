<template>
  <div v-if="fileList && printerId">
    <strong>Files:</strong>
    <v-list color="primary">
      <v-list-item v-for="file in fileList.files" :key="file.path">
        {{ file.path }} - {{ file.date }}
        <v-btn @click="deleteFile(file)">
          <v-icon>delete</v-icon>
          <v-spacer></v-spacer>
          Delete
        </v-btn>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts" setup>
import type {PrinterFile} from "@/models/printers/printer-file.model";
import type {PrinterFileCache} from "@/models/printers/printer-file-cache.model";

const printerFilesStore = usePrinterFilesStore();
const {fileList, printerId} = defineProps<{ fileList: PrinterFileCache, printerId: string }>();

async function deleteFile(file: PrinterFile) {
  fileList.files = await printerFilesStore.deletePrinterFile({
    printerId: printerId,
    fullPath: file.path
  });
}
</script>
