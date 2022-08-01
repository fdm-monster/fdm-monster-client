<template>
  <v-card>
    <v-card-title>
      Printers
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="p-2"
        hide-details
        label="Search"
        single-line
      ></v-text-field>
    </v-card-title>

    This page is under construction. <strong>Vuetify 3 has no datatable yet.</strong>

    <v-data-table
      :expanded.sync="expanded"
      :headers="tableHeaders"
      :items="printers"
      :search="search"
      :single-expand="true"
      class="elevation-1"
      item-key="id"
      show-expand
    >
      <template v-if="reorder" v-slot:body="props">
        <draggable :list="props.items" tag="tbody">
          <slot></slot>
          <tr v-for="(printer, index) in props.items" :key="index">
            <td>
              <v-icon class="reorder-row-icon">reorder</v-icon>
              {{ printer.sortIndex }}
            </td>
            <td>{{ printer.printerName }}</td>
            <td>{{ printer.group }}</td>
            <td>{{ printer.enabled }}</td>
          </tr>
        </draggable>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Showing printers</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-switch
            v-model="reorder"
            class="mt-5 mr-3"
            dark
            label="Sort mode"
          />

          <v-btn
            class="ml-3"
            color="primary"
            type="button"
            @click="openImportJsonPrintersDialog()"
          >
            Import JSON Printers
          </v-btn>

          <v-btn
            class="ml-3"
            color="primary"
            type="button"
            @click="openCreatePrinterDialog()"
          >
            Create Printer
          </v-btn>

          <v-switch
            v-show="false"
            v-model="deleteMany"
            class="mt-5 mr-3"
            dark
            label="Delete printers"
          />
          <v-switch
            v-show="false"
            v-model="bulkFileClean"
            class="mt-5 mr-3"
            dark
            disabled
            label="Bulk file clean"
          />
          <v-switch
            v-show="false"
            v-model="bulkUpdate"
            class="mt-5"
            dark
            disabled
            label="Bulk file clean"
          />
        </v-toolbar>
      </template>
      <template v-slot:item.enabled="{ item }">
        <v-switch
          v-model="item.enabled"
          color="primary"
          dark
          inset
          @click.native.capture.stop="toggleEnabled($event, item)"
        >
          {{ item.enabled }}
        </v-switch>
      </template>
      <template v-slot:item.printerName="{ item }">
        <v-chip color="primary" dark>
          {{ item.printerName || item.printerURL }}
        </v-chip>
      </template>
      <template v-slot:item.group="{ item }">
        <v-chip v-if="item.group" color="primary" dark>
          {{ item.group }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <PrinterUrlAction :printer="item" />
        <PrinterConnectionAction :printer="item" />
        <PrinterSettingsAction
          :printer="item"
          v-on:update:show="openEditDialog(item)"
        />
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <PrinterDetails :printer="item"></PrinterDetails>
        </td>
      </template>
    </v-data-table>

    <BatchJsonCreateDialog />
  </v-card>
</template>

<script lang="ts" setup>
import type { Printer } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend/printers.service";
import { usePrintersStore } from "@/stores/printers";

const printersStore = usePrintersStore();
const reorder = false;
const deleteMany = false;
const bulkFileClean = false;
const bulkUpdate = false;

const autoPrint = true;
const search = "";
const expanded: any[] = [];
const tableHeaders = [
  {
    text: "Order",
    align: "start",
    sortable: true,
    value: "sortIndex",
  },
  { text: "Enabled", value: "enabled" },
  {
    text: "Printer Name",
    align: "start",
    sortable: true,
    value: "printerName",
  },
  { text: "Groups", value: "group" },
  { text: "Actions", value: "actions", sortable: false },
  { text: "", value: "data-table-expand" },
];

const printers = computed(() => {
  return printersStore.printers;
});

function openEditDialog(printer: Printer) {
  printersStore.setUpdateDialogPrinter(printer);
}

function openCreatePrinterDialog() {
  printersStore.setCreateDialogOpened(true);
}

async function openImportJsonPrintersDialog() {
  printersStore.setBatchJsonCreateDialogOpened(true);
}

async function toggleEnabled(event: any, printer: Printer) {
  if (!printer.id) {
    throw new Error("Printer ID not set, cant toggle enabled");
  }
  const isPrinterEnabled = printer.enabled;
  if (!isPrinterEnabled || confirm("Are you sure?")) {
    printer.enabled = !printer.enabled;
    await PrintersService.toggleEnabled(printer.id, printer.enabled);
  }
}
</script>

<style>
.reorder-row-icon {
  cursor: move;
}
</style>
