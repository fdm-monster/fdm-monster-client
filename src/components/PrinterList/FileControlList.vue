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

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { usePrinterStore } from "@/store/printer.store";
import { FileDto } from "@/models/printers/printer-file.model";

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
    fileList: Object as PropType<FileDto[]>,
    printerId: String,
  },
  computed: {},
  methods: {
    async deleteFile(file: FileDto) {
      if (!this.fileList || !this.printerId) return;

      await this.printersStore.deletePrinterFile(this.printerId, file.path);
    },
  },
  watch: {},
});
</script>
