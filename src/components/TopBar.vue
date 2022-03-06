<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="text-uppercase white--text">
      <span class="font-weight-light">FDM</span>
      <strong>Monster</strong>
      <strong class="ml-14"> {{ currentTimeDiff4h || getWorkTimeDiff() }}H to 16:00</strong>
      <strong class="ml-14"> {{ currentTimeDiff5h || getWorkTimeDiff() }}H to 17:00</strong>
      <strong class="ml-14"> {{ currentTimeDiff6h || getWorkTimeDiff() }}H to 18:00</strong>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!--    <PrintJobsMenu/>-->
  </v-app-bar>
</template>

<script lang="ts" setup>
// import PrintJobsMenu from "@/components/Generic/PrintJobsMenu.vue";

import {DateTime} from "luxon";

let currentTimeDiff4h = "";
let currentTimeDiff5h = "";
let currentTimeDiff6h = "";

function getWorkTimeDiff() {
  setWorkTimeDiff();

  setInterval(() => {
    setWorkTimeDiff();
  }, 15000);
}

function setWorkTimeDiff() {
  currentTimeDiff4h = DateTime.fromObject({hour: 16}).diffNow().toFormat("hh:mm");
  currentTimeDiff5h = DateTime.fromObject({hour: 17}).diffNow().toFormat("hh:mm");
  currentTimeDiff6h = DateTime.fromObject({hour: 18}).diffNow().toFormat("hh:mm");
}
</script>
