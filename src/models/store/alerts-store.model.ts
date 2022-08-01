import type { VuetifyAlert } from "@/models/ui/vuetify-alert.model";

export interface AlertsStore {
  count: number;
  alerts: VuetifyAlert[];
  lastUpdated?: number;
}
