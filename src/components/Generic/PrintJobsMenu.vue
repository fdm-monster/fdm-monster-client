<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="400"
      bottom
      offset-x
      offset-y
      right
      transition="slide-x-transition"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn :color="activePrintCount ? 'green' : 'secondary'" dark v-bind="attrs" v-on="on">
          <span>Print jobs {{ activePrintCount ? `(${activePrintCount})` : "" }}</span>
          <v-icon right>work</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar size="50">
              <v-avatar color="primary"> {{ activePrintCount }}</v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>Print Jobs</v-list-item-title>
            </v-list-item-content>
            <v-text-field
              v-model="search"
              class="p-2"
              autofocus
              clearable
              label="Search"
              persistent-placeholder
              placeholder="Search printers"
              prepend-icon="search"
              single-line
            ></v-text-field>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item v-if="!activePrintCount"> No search results</v-list-item>
          <v-list-item v-for="{ printer, job } of activePrintJobs" :key="printer.id">
            <v-list-item-action>
              <v-progress-circular
                :size="60"
                :value="job?.progress?.completion"
                :width="5"
                color="green"
              >
                {{ truncateProgress(job.progress?.completion) + "%" || "" }}
              </v-progress-circular>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ job.job?.file?.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Elapsed:
                <strong>{{ Math.round(job?.progress?.printTime / 60) }} minutes</strong>
                <br />
                Printer: <strong>{{ printer.name }}</strong>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text @click="closeMenu()">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrinterStore } from "@/store/printer.store";
import { usePrinterStateStore } from "@/store/printer-state.store";

interface Data {
  search: string;
  menu: boolean;
}

export default defineComponent({
  name: "PrintJobsMenu",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    menu: false,
    search: "",
  }),
  computed: {
    activePrintJobs() {
      return this.printerStateStore.printersWithJob.filter((p) => {
        const fileName = p.job?.job?.file.name;
        const fileNameSearch = fileName?.toLowerCase() || "";
        const printerUrlSearch = p.printer.printerURL?.toLowerCase() || "";
        const searchSearch = p.printer.name?.toLowerCase() || "";

        const combineSearch = `${fileNameSearch} ${printerUrlSearch} ${searchSearch}`;
        return !this.search || combineSearch.includes(this.search.toLowerCase());
      });
    },
    activePrintCount() {
      return this.activePrintJobs.length || 0;
    },
    currentJob() {
      return (printerId: string) => {
        if (!printerId?.length) return;
        return this.printerStateStore.printerJobsById[printerId];
      };
    },
  },
  methods: {
    closeMenu() {
      this.menu = false;
    },
    truncateProgress(progress: number) {
      if (!progress) return "";
      return progress?.toFixed(0);
    },
  },
  watch: {
    menu() {
      this.search = "";
    },
  },
});
</script>
