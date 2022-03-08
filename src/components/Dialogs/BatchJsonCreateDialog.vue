<template>
  <v-row justify="center">
    <v-dialog v-model="mutableShow" :max-width="'600px'" persistent>
      <validation-observer ref="validationObserver" v-slot="{ invalid }">
        <v-card>
          <v-card-title>
            <span class="text-h5"> Batch Import JSON printers </span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <validation-provider v-slot="{ errors }" name="JSON" rules="required|json">
                  <v-textarea
                      v-model="formData.json"
                      :error-messages="errors"
                      data-vv-validate-on="change|blur"
                      @change="updatePrinterCount()"
                  >
                    <template v-slot:label>
                      <div>JSON import <small>(optional)</small></div>
                    </template>
                  </v-textarea>
                </validation-provider>
                {{ numPrinters }} printers
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <em class="red--text">* indicates required field</em>
            <v-spacer></v-spacer>
            <v-btn text @click="closeDialog()">Close</v-btn>
            <v-btn :disabled="invalid" color="blue darken-1" text @click="submit()">Create</v-btn>
          </v-card-actions>
        </v-card>
      </validation-observer>
    </v-dialog>
  </v-row>
</template>

<script lang="ts" setup>
import {PrintersService} from "@/backend";
import {computed} from "vue";
import {onMounted} from "@vue/runtime-core";

const props = defineProps<{ show: boolean }>();
const formData: any = {};
let numPrinters = 0;
// const validationObserver: InstanceType<typeof ValidationObserver>;

const mutableShow = computed(() => {
  // https://forum.vuejs.org/t/update-data-when-prop-changes-data-derived-from-prop/1517/27
  return show;
});

function mutableShow(newValue: boolean) {
  // TODO bus // emit
  // $emit("update:show", newValue);
}

async function updatePrinterCount() {
  numPrinters = (await parsedPrinters()).length;
}

async function parsedPrinters() {
  if (!$refs.validationObserver) return [];
  if (!(await isValid())) return [];

  const data = JSON.parse(formData.json);
  if (!Array.isArray(data)) return [];

  return data;
}

onMounted(async () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeDialog();
    }
  });

  numPrinters = 0;
});

async function isValid() {
  return await $refs.validationObserver.validate();
}

async function submit() {
  if (!(await isValid())) return;

  const printers = await parsedPrinters();

  const numPrinters = printers.length;
  const answer = confirm(`Are you sure to import ${numPrinters} printers?`);

  if (answer) {
    printers.forEach((p) => {
      p.enabled = false;
      if (p["_id"]) {
        delete p["_id"];
      }
      if (p["apikey"]) {
        p.apiKey = p["apikey"];
        delete p["apikey"];
      }
      if (p["settingsApperance"]) {
        p.settingsAppearance = p["settingsApperance"];
        delete p["settingsApperance"];
      }
    });
    await PrintersService.batchImportPrinters(printers);
  }

  closeDialog();
}

function closeDialog() {
  mutableShow.value = false;
}

</script>
