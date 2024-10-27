<template>
  <v-sheet height="100%" width="100%">
    <v-container>
      <v-row>
        <v-col>
          <v-icon>filter_list</v-icon>
          Filter by printer name (optional)
        </v-col>
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
            <th class="text-left">Floor</th>
            <th class="text-left">Fail/ Success/ Total</th>
            <th class="text-left">Last success</th>
            <th class="text-left">Last failure</th>
            <th class="text-left">Successes (week/48H/24H)</th>
            <th class="text-left">Failures (week/48H/24H)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in shownCompletions" :key="item.printerId">
            <td>{{ printer(item.printerId)?.name ?? "?" }}</td>
            <td>{{ floorOfPrinter(item.printerId)?.name ?? "?" }}</td>
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

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { PrintCompletionsService } from "@/backend/print-completions.service";
import { PrinterCompletions } from "@/models/print-completions/print-completions.model";
import { usePrinterStore } from "@/store/printer.store";
import { useFloorStore } from "@/store/floor.store";
import { IdType } from "@/utils/id.type";

const loadedCompletions = ref<PrinterCompletions[]>([]);
const shownCompletions = ref<PrinterCompletions[]>([]);
const printerNameSearch = ref<string>("");

const printerStore = usePrinterStore();
const floorStore = useFloorStore();

onMounted(async () => {
  await loadCompletions();
});

watch([() => printerNameSearch.value], () => {
  updatePrinters();
});

const loadCompletions = async () => {
  loadedCompletions.value = [];
  shownCompletions.value = [];
  loadedCompletions.value = await PrintCompletionsService.getCompletions();
  updatePrinters();
};

const printer = (printerId: IdType) => {
  return printerStore.printer(printerId);
};

const floorOfPrinter = (printerId: IdType) => {
  return floorStore.floorOfPrinter(printerId);
};

const updatePrinters = () => {
  const pIds = printerStore.printers.map((p) => p.id);

  // Determine printers from store, any unknown ID's filtered out
  const preSearchPrints = pIds.length
    ? loadedCompletions.value.filter((c) => pIds.includes(c.printerId))
    : loadedCompletions.value;

  const preSortPrints = printerNameSearch.value?.length
    ? preSearchPrints.filter((p) => {
        const printer = printerStore.printers.find((spr) => spr.id === p.printerId);
        if (!printer) return false;

        return (printer.name + printer.printerURL)
          .toLowerCase()
          .includes(printerNameSearch.value.toLowerCase());
      })
    : preSearchPrints;

  shownCompletions.value = preSortPrints.sort((p1, p2) => {
    if (p1.failureCount === p2.failureCount) {
      return p1.printCount > p2.printCount ? -1 : 1;
    }
    return p1.failureCount > p2.failureCount ? -1 : 1;
  });
};
</script>
