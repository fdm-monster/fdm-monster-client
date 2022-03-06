<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="2">
        <v-navigation-drawer permanent>
          <v-list-item two-line>
            <v-list-item-header>
              <v-list-item-title class="text-h6"> Settings</v-list-item-title>
              <v-list-item-subtitle> Adjust your Fdm Monster</v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>

          <v-divider></v-divider>

          <v-list density="compact" nav>
            <v-list-item v-for="(item, i) in items" :key="i" :to="item.path" :value="item" router-link>
              <v-list-item-avatar>
                <v-icon :icon="item.icon"></v-icon>
              </v-list-item-avatar>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>
      <v-col>
        <router-view></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>

// import CreatePrinterGroupDialog from "@/components/Generic/Dialogs/CreatePrinterGroupDialog";

const items = [
  {title: "Printer groups", icon: "dashboard", path: "/settings/printer-groups"},
  {title: "User Management", icon: "group", path: "/settings/user-management"},
  {title: "FDM settings", icon: "image", path: "/settings/system"},
  {title: "Other", icon: "help", path: "/settings/other"}
];

</script>

<style>
body {
  background-color: black;
}
</style>