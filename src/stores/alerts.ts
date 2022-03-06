import type { AlertsStore } from "@/models/store/alerts-store.model";
import { defineStore } from "pinia";

export const useAlertsStore = defineStore({
    id: 'alerts',
    state: (): AlertsStore => ({
        count: 0,
        lastUpdated: undefined,
        alerts: []
    }),
});