<template>
  <v-row justify="center">
    <v-dialog v-model="showDialog" permanent>
      <v-card width="600">
        <v-card-title>
          <span class="text-h5"> Batch Import JSON printers </span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <form>
                <SchemaFormWithValidation
                  ref="schemaFormRef"
                  :schema="formLayout"
                  :validation-schema="formSchema"
                  @submit="submit"
                >
                </SchemaFormWithValidation>
              </form>

              {{ numPrinters }} printers provided
              <v-list>
                <v-list-item v-for="error of formErrors">
                  {{ error }}
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog()">Close</v-btn>
          <v-btn :disabled="!isFormValid" text @click="submit()">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { PrintersService } from "@/backend";
import { type FormArraySchema, useSchemaForm } from "formvuelate";
import type { FormValidation } from "@/utils/types/FormValidation";
import {
  batchCreateForm,
  type BatchCreateFormType,
} from "@/models/forms/printer-batch-create.form";
import type { PrintersStore } from "@/models/store/printer-store.model";
import type { SubscriptionCallbackMutation } from "pinia";
import { bindWindowEscape } from "@/utils/window-listener.utils";

export default defineComponent({
  setup: () => {
    const formInstance = batchCreateForm();
    const formData = ref<BatchCreateFormType>(
      formInstance.getDefaultFormData()
    );
    useSchemaForm(formData);

    return {
      formInstance,
      formLayout: ref<FormArraySchema>(formInstance.formLayout),
      formSchema: formInstance.formSchema,
      formData,
      schemaFormRef: ref(),
      printersStore: usePrintersStore(),
      showDialog: ref<boolean>(false),
    };
  },
  data: (): { formValidation: FormValidation | null } => ({
    formValidation: null,
  }),
  watch: {
    "schemaFormRef.slotBinds.validation.meta"() {
      this.formValidation = this.schemaFormRef?.slotBinds.validation;
    },
  },
  async mounted() {
    this.bindEscapeListener();
    this.resetFormData();
    this.subscribeDialogState();
  },
  computed: {
    formErrors() {
      if (this.isFormValid) return [];
      if (!this.formValidation?.errors?.length) return [];

      return this.formValidation?.errors;
    },
    numPrinters() {
      return this.parsePrintersFromJson().length;
    },
    mutableShow() {
      return this.showDialog;
    },
    isFormValid() {
      return this.formValidation?.meta?.valid;
    },
  },
  methods: {
    subscribeDialogState() {
      this.printersStore.$subscribe(this.onDialogStateChange);
    },
    onDialogStateChange(
      mutation: SubscriptionCallbackMutation<PrintersStore>,
      state: PrintersStore
    ) {
      this.showDialog = state.batchJsonCreateDialogOpened;
    },
    dialogOpenedState() {
      return this.printersStore.batchJsonCreateDialogOpened;
    },
    bindEscapeListener() {
      bindWindowEscape(this.closeDialog);
    },
    resetFormData() {
      this.formData = this.formInstance.getDefaultFormData();
    },
    parsePrintersFromJson() {
      if (!this.formData?.raw) return [];

      const parseResult = this.formInstance.parseData(this.formData);
      if (!parseResult.success) return [];

      return parseResult.data.raw;
    },
    closeDialog() {
      this.printersStore.setBatchJsonCreateDialogOpened(false);
    },
    submit: async function () {
      // TODO convert printers to post-create version with settingsAppearance
      const printers = this.parsePrintersFromJson();

      const numPrinters = printers.length;
      const answer = confirm(`Are you sure to import ${numPrinters} printers?`);

      if (answer) {
        printers.forEach((p) => {
          p.enabled = false;
          const pUntyped = p as any;
          if (pUntyped["_id"]) {
            // @ts-ignore
            delete p["_id"];
          }
          if (pUntyped["apikey"]) {
            p.apiKey = pUntyped["apikey"];
            // @ts-ignore
            delete p["apikey"];
          }
          if (pUntyped["settingsApperance"]) {
            p.settingsAppearance = pUntyped["settingsApperance"];
            // @ts-ignore
            delete p["settingsApperance"];
          }
        });
        await PrintersService.batchImportPrinters(printers);
      }

      this.closeDialog();
    },
  },
});
</script>
