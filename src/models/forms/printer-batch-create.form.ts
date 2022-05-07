import { array, object, preprocess, z } from "zod";
import { jsonValidatorUtil } from "@/utils/json-validator.util";
import { toFormValidator } from "@vee-validate/zod";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import {
  printerBaseZodSchema,
  printerCreateZodSchema,
} from "@/models/forms/printer-zod.schema";
import type { FormArraySchema } from "formvuelate";

const zodSchema = object({
  raw: preprocess(
    (val) => jsonValidatorUtil(val),
    array(printerCreateZodSchema).min(1)
  ),
});

export type BatchCreateFormType = z.infer<typeof zodSchema>;

const getDefaultFormData: () => BatchCreateFormType = () => ({
  raw: [],
});

const formLayout: FormArraySchema = [
  {
    component: FormTextArea,
    label: "JSON import (optional)",
    model: "raw",
  },
];

markRaw(FormTextArea);

export const batchCreateForm = () => ({
  zodSchema,
  parseData: (data: BatchCreateFormType) => zodSchema.safeParse(data),
  formSchema: toFormValidator(zodSchema),
  getDefaultFormData,
  formLayout,
});
