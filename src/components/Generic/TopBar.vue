<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="text-uppercase white--text">
      <span class="font-weight-light">FDM</span>
      <strong>Monster</strong>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <PrintJobsMenu />
  </v-app-bar>
</template>

<script lang="ts">
import PrintJobsMenu from "@/components/Generic/PrintJobsMenu.vue";
import { defineComponent } from "vue";
import { DateTime, Duration } from "luxon";

// interface Data {}

export default defineComponent({
  name: "TopBar",
  components: { PrintJobsMenu },
  setup: () => {
    return {};
  },
  async created() {},
  async mounted() {},
  props: {},
  // data: (): Data => (),
  computed: {},
  methods: {},
  watch: {},
});
</script>

<style lang="scss">
.border-time {
  border: 1px solid white;

  * {
    border: none;
  }
}
</style>
