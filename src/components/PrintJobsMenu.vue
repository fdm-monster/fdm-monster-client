<template>
  <div class="text-center">
    <v-menu
        v-model="state.menu"
        :close-on-content-click="false"
        :nudge-width="300"
        anchor="start"
        open-on-hover
        transition="slide-x-transition"
    >
      <template v-slot:activator="{ props }">
        <!--            :color="activePrintCount ? 'green' : 'success'"-->
        <v-btn
            :elevation="3"
            color="secondary"
            flat
            v-bind="props"
        >
          <span>
            Print jobs
            {{ activePrintCount ? `(${activePrintCount})` : "" }}
          </span>
          <v-icon right>work</v-icon>
        </v-btn>
      </template>

      <v-card min-width="300">
        <v-list>
          <v-list-item>
            <v-list-item-avatar size="50">
              <v-avatar class="ml" color="primary">{{ activePrintCount }}</v-avatar>
            </v-list-item-avatar>

            <v-list-item-header class="pl-2">
              <v-list-item-title>Print Jobs</v-list-item-title>
            </v-list-item-header>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item v-if="!activePrintCount"> No active prints</v-list-item>
          <v-list-item v-for="printer of activePrintJobs" :key="printer.id">
            <template v-slot:append>
              <v-list-item-avatar start>
                <v-progress-circular
                    :size="60"
                    :value="jobProgress(printer.currentJob)"
                    :width="5"
                    color="green"
                >
                  {{ truncateJobProgress(printer.currentJob) + "%" || "" }}
                </v-progress-circular>
              </v-list-item-avatar>
            </template>
            <v-list-item-header>
              <v-list-item-title>
                {{ printer.currentJob.fileName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Elapsed:
                {{ getElapsedJobTime(printer) }}
                minutes <br/>
                Printer: {{ printer.printerName }}
              </v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text @click="state.menu = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import type {Printer} from "@/models/printers/printer.model";
import type {PrinterCurrentJob, PrinterJob} from "@/models/printers/printer-current-job.model";

export default defineComponent({
  setup: () => {
    const printersStore = usePrintersStore();
    return {
      printersStore,
      activePrintJobs: computed(() => printersStore.printersWithJob),
      activePrintCount: computed(() => printersStore.printersWithJob?.length),
      state: reactive({menu: false})
    }
  },
  methods: {
    jobProgress(printerJob: PrinterCurrentJob | PrinterJob) {
      return (printerJob as PrinterCurrentJob)?.progress;
    },
    truncateJobProgress(printerJob: PrinterCurrentJob | PrinterJob) {
      const progress = this.jobProgress(printerJob);
      if (!progress) return "";
      return progress?.toFixed(0);
    },
    getElapsedJobTime(printer: Printer) {
      const jobCurrent = (printer.currentJob as PrinterCurrentJob);
      if (jobCurrent) {
        return Math.round(jobCurrent.printTimeElapsed / 60);
      }
      return "-";
    }
  }
})
</script>
