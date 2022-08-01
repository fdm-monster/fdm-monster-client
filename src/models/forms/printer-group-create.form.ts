import { toFormValidator } from "@vee-validate/zod";
import type { BatchCreateFormType } from "@/models/forms/printer-batch-create.form";
import FormText from "@/components/Forms/FormText.vue";
import type { FormArraySchema } from "formvuelate";
import { SchemaForm } from "formvuelate";
import { generateAppConstants } from "@/shared/app.constants";
import { array, custom, number, object, string, z } from "zod";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import type { PrinterInGroup } from "@/models/printers/printer-group.model";

const appConstants = generateAppConstants();

// This is reshaped afterwards into semi-nested form
const zodSchema = object({
  name: string().max(appConstants.maxPrinterGroupNameLength),
  location: object({
    x: string().max(appConstants.maxPrinterGroupLocationX),
    y: string().max(appConstants.maxPrinterGroupLocationY),
  }),
  printers: array(custom<PrinterInGroup>()).default([]),
});

export type PrinterGroupCreateFormType = z.infer<typeof zodSchema>;

const getDefaultFormData: () => PrinterGroupCreateFormType = () => ({
  name: newRandomNamePair(),
  location: {
    x: "0",
    y: "0",
  },
  printers: [],
});

const formLayout: FormArraySchema = [
  {
    component: FormText,
    label: "Name",
    model: "name",
  },
  {
    component: SchemaForm,
    model: "location",
    schema: [
      {
        component: FormText,
        label: "Location X",
        model: "x",
      },
      {
        component: FormText,
        label: "Location Y",
        model: "y",
      },
    ],
  },
];

// markRaw(FormTextArea);
markRaw(FormText);

export const printerGroupCreateForm = () => ({
  zodSchema,
  parseData: (data: BatchCreateFormType) => zodSchema.safeParse(data),
  formSchema: toFormValidator(zodSchema),
  getDefaultFormData,
  formLayout,
});
