import { toFormValidator } from "@vee-validate/zod";
import type { BatchCreateFormType } from "@/models/forms/printer-batch-create.form";
import { printerPreCreateZodSchema } from "@/models/forms/printer-zod.schema";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import type { z } from "zod";
import type { FormArraySchema } from "formvuelate";
import FormText from "@/components/Forms/FormText.vue";

export type PrinterPreCreateZodType = z.infer<typeof printerPreCreateZodSchema>;

export const getDefaultFormData = (): PrinterPreCreateZodType => ({
  id: undefined,
  printerName: newRandomNamePair(),
  printerHostPrefix: "http",
  printerHostPort: 80,
  websocketPrefix: "ws",
  printerHostName: "",
  sortIndex: 0,
  apiKey: "",
  enabled: true,
  stepSize: 1,
});

const formLayout: FormArraySchema = [
  {
    component: FormText,
    label: "Printer Name",
    model: "printerName",
  },
  {
    component: FormText,
    label: "IP/Host",
    model: "printerHostName",
  },
  {
    component: FormText,
    label: "Host Port",
    model: "printerHostPort",
  },
];

// markRaw(FormTextArea);
markRaw(FormText);

// Standard form interface
export const printerCrudForm = () => ({
  zodSchema: printerPreCreateZodSchema,
  parseData: (data: BatchCreateFormType) =>
    printerPreCreateZodSchema.safeParse(data),
  formSchema: toFormValidator(printerPreCreateZodSchema),
  getDefaultFormData,
  formLayout,
});
