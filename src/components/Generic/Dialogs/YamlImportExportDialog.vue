<template>
  <BaseDialog :id="dialogId" max-width="700px">
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> YAML export and import </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12"> Click here to upload a YAML file</v-col>
        </v-row>
        <v-row>
          <v-radio-group row :value="0">
            <v-radio label="Import YAML" />
            <v-radio label="Export YAML" />
          </v-radio-group>
        </v-row>

        <div>
          <v-file-input accept=".yaml" label="Upload YAML"></v-file-input>

          <v-checkbox label="Include printers" />
          <v-checkbox label="Include printer positions" />
          <v-checkbox label="Include floors" />
        </div>
      </v-card-text>
      <v-card-actions>
        <em class="red--text">* indicates required field</em>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">Close</v-btn>
        <v-btn color="blue" text @click="submit()">Create</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrintersStore } from "@/store/printers.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { WithDialog } from "@/utils/dialog.utils";

interface Data extends WithDialog {
  someProp?: any;
}

export default defineComponent({
  name: "YamlImportExportDialog",
  components: {},
  setup: () => {
    return {
      printersStore: usePrintersStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    dialogId: DialogName.YamlImportExport,
  }),
  computed: {},
  methods: {
    async submit() {
      this.closeDialog();
    },
    closeDialog() {
      this.dialogsStore.closeDialog(this.dialogId);
    },
  },
  watch: {},
});
</script>
