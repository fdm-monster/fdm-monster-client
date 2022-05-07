<template>
  <v-container>
    <h2 class="text-center">This page was not found.</h2>

    <v-row justify="space-between">
      <v-col cols="12" md="4">
        <form>
          <SchemaFormWithValidation
            :schema="schema"
            :validation-schema="validationSchema"
            @submit="submitField"
          >
            <template #afterForm="{ validation }">
              <v-btn :disabled="!validation.meta.valid" type="submit"
                >Submit
              </v-btn>
              <span>Attempted submits: {{ validation.submitCount }}</span
              ><br />
              <span>Values: {{ validation.values }}</span
              ><br />
              <span>Errors: {{ validation.errors }}</span
              ><br />
              <span>Metadata: {{ validation.meta }}</span>
            </template>
          </SchemaFormWithValidation>
        </form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import type { FormArraySchema } from "formvuelate";
import { useSchemaForm } from "formvuelate";
import FormText from "@/components/Forms/FormText.vue";
import { object, string, z } from "zod";
import { toFormValidator } from "@vee-validate/zod";
import type { Ref } from "vue";

markRaw(FormText);

const zodSchema = object({
  email: string().email(),
  email2: string().email(),
  password: string().min(5),
  fullName: string(),
});
// The validation schema
const validationSchema = toFormValidator(zodSchema);

type Person = z.infer<typeof zodSchema>;

export default defineComponent({
  data: () => ({}),
  setup() {
    const schema = ref<FormArraySchema>([
      {
        component: FormText,
        label: "Email",
        model: "email",
      },
      {
        component: FormText,
        label: "Password",
        model: "password",
      },
      {
        component: FormText,
        label: "Full Name",
        model: "fullName",
      },
    ]);
    const formData: Ref<Person> = ref<Person>({
      email: "davidzwa@gmail.com",
      email2: "asd",
      password: "Passrod",
      fullName: " asdasdasdasdas",
    });

    useSchemaForm(formData);
    return {
      formData,
      schema,
      validationSchema,
    };
  },
  computed: {},
  methods: {
    async submitField() {
      console.log(JSON.stringify(this.formData));
    },
  },
});
</script>