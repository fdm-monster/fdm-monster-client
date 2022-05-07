<template>
  <v-row>
    <v-navigation-drawer>
      <v-list-item two-line>
        <v-list-item-header>
          <v-list-item-title class="text-h6"> Settings</v-list-item-title>
          <v-list-item-subtitle>Adjust your Fdm Monster</v-list-item-subtitle>
        </v-list-item-header>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.path"
            router-link
        >
          <v-list-item-avatar>
            <v-icon :icon="item.icon"></v-icon>
          </v-list-item-avatar>
          <v-list-item-title
              class="pl-2"
              v-text="item.title"
          ></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-col>
      <router-view></router-view>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
const items = [
  {
    title: "Printer groups",
    icon: "dashboard",
    path: "/settings/printer-groups",
  },
  {
    title: "User Management",
    icon: "group",
    path: "/settings/user-management",
  },
  {title: "FDM settings", icon: "image", path: "/settings/system"},
  {title: "Other", icon: "help", path: "/settings/other"},
];
</script>

<style></style>
