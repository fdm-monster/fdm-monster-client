<template>
  <v-container>
    <PrintStatistics />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PrintStatistics from "@/components/PrintStatistics/PrintStatistics.vue";

export default defineComponent({
  name: "PrintStatisticsView",
  components: { PrintStatistics },
});
</script>
