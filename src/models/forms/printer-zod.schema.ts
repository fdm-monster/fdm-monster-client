import { boolean, custom, number, object, string, z } from "zod";
import { UUID_LENGTH } from "@/models/printers/printer.model";
import type {
  HttpProtocol,
  WebSocketProtocol,
} from "@/models/forms/create-printer.legacy.model";

export const printerBaseZodSchema = object({
  id: string().optional(), // Only in case of update

  enabled: boolean(),
  sortIndex: number(),
  printerName: string(),

  apiKey: string().length(UUID_LENGTH),

  // Baby-stepping
  stepSize: custom<0.1 | 1 | 10 | 100>().optional().default(1),
});

export const printerPreCreateZodSchema = printerBaseZodSchema.extend({
  // Need processing before submission
  websocketPrefix: custom<WebSocketProtocol>(),
  printerHostPrefix: custom<HttpProtocol>(),
  printerHostName: string(),
  printerHostPort: number(),
});

// Maybe better to preprocess or refine instead?
export const printerCreateZodSchema = printerBaseZodSchema.extend({
  webSocketURL: string(),
  printerURL: string(),
  settingsAppearance: z.object({}).optional(),
});
export type PrinterCreateZodType = z.infer<typeof printerCreateZodSchema>;
