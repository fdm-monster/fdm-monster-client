<template>
  <v-dialog v-model="dialogShowed" :max-width="'700px'" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">
          <v-avatar color="primary" size="56">
            {{ avatarInitials }}
          </v-avatar>
          New Printer Group
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <SchemaFormWithValidation
              ref="schemaFormRef"
              :schema="formLayout"
              :validation-schema="formSchema"
              @submit="submit"
            >
            </SchemaFormWithValidation>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="red--text">* indicates required field</em>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog()">Close</v-btn>
        <v-btn
          :disabled="isFormValid"
          color="blue darken-1"
          text
          @click="submit()"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { PrinterGroupService } from "@/backend";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { bindWindowEscape } from "@/utils/window-listener.utils";
import { useSchemaForm } from "formvuelate";
import type { PrinterGroupCreateFormType } from "@/models/forms/printer-group-create.form";
import { printerGroupCreateForm } from "@/models/forms/printer-group-create.form";
import type { FormValidation } from "@/utils/types/FormValidation";

export default defineComponent({
  props: {},
  data: (): { formValidation: FormValidation | null } => ({
    formValidation: null,
  }),
  setup: () => {
    const formInstance = printerGroupCreateForm();
    const formData = ref<PrinterGroupCreateFormType>(
      formInstance.getDefaultFormData()
    );
    useSchemaForm(formData);

    return {
      formInstance,
      formLayout: ref(formInstance.formLayout),
      formSchema: formInstance.formSchema,
      formData,
      schemaFormRef: ref(),
      dialogShowed: false,
      showChecksPanel: false,
      printersStore: usePrintersStore(),
      printerGroupsStore: usePrinterGroupsStore(),
    };
  },
  mounted() {
    bindWindowEscape(this.closeDialog);
  },
  computed: {
    dialogOpenedState() {
      return this.printerGroupsStore.createGroupDialogOpened;
    },
    avatarInitials() {
      const formData = this.formData;
      if (formData && this.dialogShowed) {
        return generateInitials(formData.name);
      }
    },
  },
  methods: {
    isFormValid() {
      return this.formValidation?.meta?.valid;
    },
    closeDialog() {
      this.printerGroupsStore.setCreateGroupDialogOpened(false);
    },
    async submit() {
      if (!this.isFormValid()) return;

      if (!this.formData) return;
      const newPrinterGroupData =
        PrinterGroupService.convertCreateFormToPrinterGroup(this.formData);

      await this.printerGroupsStore.createPrinterGroup(newPrinterGroupData);

      // TODO bus
      // $bus.emit(infoMessageEvent, `Printer ${newPrinterGroupData.name} created`);

      this.closeDialog();
    },
  },
  watch: {
    dialogOpenedState(newValue?: boolean) {
      this.dialogShowed = newValue ?? false;
    },
  },
});
</script>
