<template>
  <div v-if="fileList && printerId">
    <strong>Files:</strong>
    <v-list color="primary">
      <v-list-item v-for="file in fileList" :key="file.path">
        {{ file.path }}
        <small class="ml-4 mr-4">{{ new Date(file.date).toUTCString() }}</small>
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
import { usePrinterStore } from "@/store/printer.store";
import { FileDto } from "@/models/printers/printer-file.model";

interface Props {
  fileList: FileDto[];
  printerId: string;
}

const props = defineProps<Props>();

const printersStore = usePrinterStore();

const deleteFile = async (file: FileDto) => {
  if (!props.fileList || !props.printerId) return;
  await printersStore.deletePrinterFile(props.printerId, file.path);
};
</script>
