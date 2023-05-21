<template>
  <v-sheet height="100%" width="100%">
    <v-container>
      <v-row>
        <v-col>
          <v-icon>filter_list</v-icon>
          Filtering {{ filteredFloors.length }} of {{ floors.length }} floors (optional)
        </v-col>
        <v-col>
          <v-select
            v-model="filteredFloors"
            :items="floors"
            clearable
            item-text="name"
            label="Printer Floors"
            multiple
            return-object
          >
          </v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-icon>filter_list</v-icon>
          Filtering {{ filteredFdmPrinters.length }} of {{ floorFdmPrinters.length }} FDM printers
          (optional)
        </v-col>
        <v-col>
          <v-select
            v-model="filteredFdmPrinters"
            :items="floorFdmPrinters"
            clearable
            item-text="printerName"
            label="FDM Printers"
            multiple
            open-on-clear
            return-object
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>Filter by printer name (optional)</v-col>
        <v-col>
          <v-text-field
            v-model="printerNameSearch"
            class="p-2"
            clearable
            label="Search"
            prepend-icon="search"
            single-line
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
    <v-alert>
      Please reload here if you want updated results:
      <v-btn color="primary" x-small @click="loadCompletions()">Reload</v-btn>
    </v-alert>
    <v-simple-table dark>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Printer name</th>
            <th class="text-left">Printer floor</th>
            <th class="text-left">Fail/ Success/ Total</th>
            <th class="text-left">Last success</th>
            <th class="text-left">Last failure</th>
            <th class="text-left">Successes (week/48H/24H)</th>
            <th class="text-left">Failures (week/48H/24H)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in shownCompletions" :key="item.name">
            <td>{{ printer(item._id)?.printerName }}</td>
            <td>{{ floorOfPrinter(item._id)?.name }}</td>
            <td>
              &#215; {{ item.failureCount }} / &#128504; {{ item.successCount }}
              <strong>~{{ item.printCount }}</strong>
            </td>
            <td>{{ Date.now() - item.lastSuccess?.createdAt || "-" }}</td>
            <td>
              <v-tooltip bottom>
                <template v-if="item.lastFailure?.status" v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on">info</v-icon>
                </template>
                <span>
                  {{ item.lastFailure?.status || "-" }} <br />
                  {{ item.lastFailure?.createdAt }} <br />
                  <small>{{ item.lastFailure?.fileName }}</small> <br />
                  <strong>{{ item.lastFailure?.completionLog }}</strong> <br />
                </span>
              </v-tooltip>
            </td>
            <td>
              {{ item.successEventsLastWeek }} {{ item.successEventsLast48H }}
              {{ item.successEventsLast24H }}
            </td>
            <td>
              {{ item.failureEventsLastWeek }} {{ item.failureEventsLast48H }}
              {{ item.failureEventsLast24H }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Floor } from "../../models/floors/floor.model";
import { Printer } from "@/models/printers/printer.model";
import { PrintCompletionsService } from "@/backend/print-completions.service";
import { PrinterCompletions } from "@/models/print-completions/print-completions.model";
import { usePrinterStore } from "../../store/printer.store";
import { useFloorStore } from "../../store/floor.store";

interface Data {
  loadedCompletions: PrinterCompletions[];
  shownCompletions: PrinterCompletions[];
  floorFdmPrinters: Printer[];
  filteredFdmPrinters: Printer[];
  filteredFloors: Floor[];
  printerNameSearch: string;
}

export default defineComponent({
  name: "PrintCompletionTimeline",
  components: {},
  setup: () => {
    return {
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
    };
  },
  data(): Data {
    return {
      loadedCompletions: [],
      shownCompletions: [],
      // Final result of all floors
      floorFdmPrinters: [],
      filteredFdmPrinters: [],
      filteredFloors: [],
      printerNameSearch: "",
    };
  },
  async mounted() {
    await this.loadCompletions();
  },
  computed: {
    floors() {
      return this.floorStore.floors;
    },
  },
  watch: {
    printerFloors() {
      this.updateFloors();
    },
    filteredFloors() {
      this.updateFloors();
    },
    filteredFdmPrinters() {
      this.updatePrinters();
    },
    printerNameSearch() {
      this.updatePrinters();
    },
  },
  methods: {
    async loadCompletions() {
      this.loadedCompletions = [];
      this.shownCompletions = [];
      this.loadedCompletions = await PrintCompletionsService.getCompletions();
      this.updateFloors();
      this.updatePrinters();
    },
    printer(printerId: string) {
      return this.printerStore.printer(printerId);
    },
    floorOfPrinter(printerId: string) {
      return this.floorStore.floorOfPrinter(printerId);
    },
    updateFloors() {
      if (!this.filteredFloors?.length) {
        this.floorFdmPrinters = this.printerStore.printers;
        return;
      }
      const flattenedPrinterIds = this.filteredFloors.flatMap((f) => {
        return f.printers.map((fp) => fp.printerId);
      });
      this.floorFdmPrinters = this.printerStore.printers.filter((fp) => {
        if (!fp.id) return false;
        return flattenedPrinterIds.includes(fp.id);
      });
    },
    updatePrinters() {
      const pIds = this.filteredFdmPrinters.map((p) => p.id);
      const preSearchPrints = pIds.length
        ? this.loadedCompletions.filter((c) => pIds.includes(c._id))
        : this.loadedCompletions;

      const preSortPrints = this.printerNameSearch?.length
        ? preSearchPrints.filter((p) => {
            const printer = this.floorFdmPrinters.find((f) => f.id === p._id);
            if (!printer) return false;

            return (printer.printerName + printer.printerURL)
              .toLowerCase()
              .includes(this.printerNameSearch.toLowerCase());
          })
        : preSearchPrints;

      this.shownCompletions = preSortPrints.sort((p1, p2) => {
        if (p1.failureCount === p2.failureCount) {
          return p1.printCount > p2.printCount ? -1 : 1;
        }
        return p1.failureCount > p2.failureCount ? -1 : 1;
      });
    },
  },
});
</script>

<style lang="scss"></style>
