<template>
  <v-container>
    <v-row>
      <v-col v-if="formData" cols="12" md="6">

        <v-text-field
            v-model="formData.printerName"
            :counter="printerNameRules.max"
            :error-messages="emailErrors"
            label="Printer name*"
            required
        />

        <validation-provider
            v-slot="{ errors }"
            name="Printer IP or HostName"
            rules="required|ip_or_fqdn"
        >
          <v-text-field
              v-model="formData.printerHostName"
              :error-messages="errors"
              hint="Examples: 'my.printer.com', 'localhost' or '192.x.x.x'"
              label="IP/Host*"
          ></v-text-field>
        </validation-provider>

        <validation-provider v-slot="{ errors }" name="Groups">
          <v-select
              v-model="formData.groups"
              :error-messages="errors"
              :items="printerGroupNames"
              label="Groups"
              multiple
              no-data-text="No groups known"
              required
          ></v-select>
        </validation-provider>
      </v-col>
      <v-col cols="12" md="6">
        <validation-provider v-slot="{ errors }" name="Enabled">
          <v-checkbox
              v-model="formData.enabled"
              :error-messages="errors"
              hint="Disabling makes the printer passive"
              label="Enabled*"
              persistent-hint
              required
          ></v-checkbox>
        </validation-provider>

        <validation-provider
            v-slot="{ errors }"
            name="Host Port"
            rules="required|integer|max:65535"
        >
          <v-text-field
              v-model="formData.printerHostPort"
              :error-messages="errors"
              hint="Examples: '80', '443' or '5050'"
              label="Host Port*"
          ></v-text-field>
        </validation-provider>
      </v-col>
      <v-col class="pb-5 pt-0" cols="12" md="12">
        <validation-provider v-slot="{ errors }" :rules="apiKeyRules" name="ApiKey">
          <v-text-field
              v-model="formData.apiKey"
              :counter="apiKeyRules.length"
              :error-messages="errors"
              hint="User or Application Key only (Global API key fails)"
              label="API Key*"
              persistent-hint
              required
          ></v-text-field>
        </validation-provider>
      </v-col>
    </v-row>

    <v-expansion-panels accordion>
      <v-expansion-panel>
        <v-expansion-panel-header>Advanced settings</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-col cols="12" md="12">
            <validation-provider v-slot="{ errors }" name="PrinterHostPrefix">
              <v-select
                  v-model="formData.printerHostPrefix"
                  :error-messages="errors"
                  :items="['http', 'https']"
                  label="Insecure/Secure HTTP"
                  required
                  value="http"
              ></v-select>
            </validation-provider>

            <validation-provider v-slot="{ errors }" name="WebsocketPrefix">
              <v-select
                  v-model="formData.websocketPrefix"
                  :error-messages="errors"
                  :items="['ws', 'wss']"
                  label="Insecure/Secure Websocket"
                  required
                  value="ws"
              ></v-select>
            </validation-provider>
            <validation-provider v-slot="{ errors }" name="Display">
              <v-checkbox
                  v-model="formData.display"
                  :error-messages="errors"
                  disabled
                  label="Display*"
                  required
              ></v-checkbox>
            </validation-provider>
          </v-col>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="ts">
import {computed, inject, reactive, watch} from "vue";
import {AppConstants} from "@/constants/app.constants";
import {getDefaultCreatePrinter, type PreCreatePrinter} from "@/models/printers/crud/create-printer.model";
import {PrintersService} from "@/backend";
import type {Printer} from "@/models/printers/printer.model";
import {usePrinterGroupsStore} from "@/stores/printer-groups";
import {onMounted} from "@vue/runtime-core";
import {usePrintersStore} from "@/stores/printers";
import {useField, useForm} from "vee-validate";
import * as yup from "yup";

const appConstants = inject(AppConstants);
const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();
const {printerId} = defineProps<{ printerId: string }>();
let formData: PreCreatePrinter = reactive(getDefaultCreatePrinter());
const apiKeyRules = computed(() => ({required: true, length: appConstants?.apiKeyLength, alpha_num: true}));
const printerNameRules = computed(() => ({required: true, max: appConstants?.maxPrinterNameLength}));
const printerGroupNames = computed(() => printerGroupsStore.printerGroupNames);

// Define a validation schema
const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8),
});

// Create a form context with the validation schema
const form = useForm({
  validationSchema: schema,
});

onMounted(async () => {
  if (printerId) {
    const crudeData = printersStore.printer(printerId);
    if (!crudeData) return;
    formData = PrintersService.convertPrinterToCreateForm(crudeData);
  }
  await printerGroupsStore.loadPrinterGroups();
});

watch(() => printerId, (val) => {
  if (!val) return;
  const printer = printersStore.printer(val) as Printer;
  formData = PrintersService.convertPrinterToCreateForm(printer);
});
</script>
