<template>
  <div v-if="fileList && printerId">
    <strong>Files:</strong>
    <v-list color="primary">
      <v-list-item v-for="file in fileList.files" :key="file.path">
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

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PrinterFileDto } from "@/models/printers/printer-file.model";
import { usePrinterStore } from "@/store/printer.store";

export default defineComponent({
  name: "FileControlList",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {
    fileList: Object as PropType<PrinterFileDto[]>,
    printerId: String,
  },
  computed: {},
  methods: {
    async deleteFile(file: PrinterFileDto) {
      if (!this.fileList || !this.printerId) return;

      await this.printersStore.deletePrinterFile(this.printerId, file.path);
    },
  },
  watch: {},
});
</script>
