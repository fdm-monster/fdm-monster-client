<template>
  <v-row no-gutters>
    <div>
      <v-navigation-drawer>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6"> Settings</v-list-item-title>
            <v-list-item-subtitle> Adjust your Fdm Monster</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense nav>
          <v-list-item v-for="item in items" :key="item.title" :to="item.path" link router-link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </div>

    <router-view class="grow" />
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePrinterStore } from "../../store/printer.store";

interface Data {
  items: any[];
}

export default defineComponent({
  name: "SettingsView",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    items: [
      {
        title: "Grid",
        icon: "grid_on",
        path: "/settings/grid",
      },
      {
        title: "Floors",
        icon: "house_siding",
        path: "/settings/floors",
      },
      {
        title: "User Management",
        icon: "group",
        path: "/settings/user-management",
      },
      { title: "FDM Monster settings", icon: "image", path: "/settings/system" },
      { title: "Emergency Commands", icon: "warning", path: "/settings/emergency-commands" },
    ],
  }),
  computed: {},
  methods: {},
  watch: {},
});
</script>
