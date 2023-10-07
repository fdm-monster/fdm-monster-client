<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Grid Settings</v-toolbar-title>
    </v-toolbar>

    <v-list subheader three-line>
      <v-subheader>Grid Rows and Columns</v-subheader>
      <v-list-item>
        <v-list-item-content>
          <v-row v-if="settingsStore.settings?.frontend">
            <v-col cols="2">
              <v-select
                v-model="settingsStore.settings.frontend.gridRows"
                :items="rowOptions()"
                label="Set the grid rows"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="settingsStore.settings.frontend.gridCols"
                :items="colOptions()"
                label="Set the grid columns"
              ></v-select>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col>
              <v-btn color="primary" @click="updateGridSettings()">Save tile settings</v-btn>
            </v-col>
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider />
    <v-list subheader three-line>
      <v-subheader>Large or Compact Tiles</v-subheader>
      <v-list-item>
        <v-list-item-content>
          <v-row v-if="settingsStore.settings?.frontend">
            <v-col cols="5">
              <v-checkbox
                v-model="settingsStore.settings.frontend.largeTiles"
                label="Large tiles"
              ></v-checkbox>
            </v-col>
            <v-col cols="1">
              <v-btn color="primary" @click="updateGridSettings()">Save tile settings</v-btn>
            </v-col>
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useSettingsStore } from "../../store/settings.store";
import { colOptions, rowOptions } from "../../shared/printer-grid.constants";
import { useSnackbar } from "@/shared/snackbar.composable";

interface Data {
  property: number;
}

export default defineComponent({
  name: "GridSettings",
  components: {},
  setup: () => {
    return {
      settingsStore: useSettingsStore(),
      snackbar: useSnackbar(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    property: 0,
  }),
  computed: {
    largeTilesSettings() {
      return this.settingsStore.largeTiles;
    },
  },
  methods: {
    rowOptions() {
      return rowOptions;
    },
    colOptions() {
      return colOptions;
    },
    async updateGridSettings() {
      await this.settingsStore.updateFrontendSettings({
        gridCols: this.settingsStore.gridCols,
        gridRows: this.settingsStore.gridRows,
        largeTiles: this.largeTilesSettings,
      });
      this.snackbar.info("Grid settings updated");
    },
  },
  watch: {},
});
</script>
