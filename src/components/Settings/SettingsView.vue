<template>
  <v-container>
    <!-- Back Button Header -->
    <v-row>
      <v-col cols="12">
        <v-btn text to="/settings" class="px-0">
          <v-icon left>md-arrow_back</v-icon>
          Settings
        </v-btn>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row>
      <!-- Left Navigation Drawer -->
      <v-col cols="12" md="3">
        <v-navigation-drawer permanent class="elevation-1">
          <v-list>
            <v-list-item to="/settings/account">
              <v-list-item-icon>
                <v-icon>md-person</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>My account</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-group prepend-icon="md-account_circle" no-action>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Profile</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item to="/settings/profile/general">
                <v-list-item-title>General</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item to="/settings/calendars">
              <v-list-item-icon>
                <v-icon>md-calendar_today</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Calendars</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item to="/settings/conferencing">
              <v-list-item-icon>
                <v-icon>md-videocam</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Conferencing</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item to="/settings/appearance" class="v-list-item--active">
              <v-list-item-icon>
                <v-icon>md-palette</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Appearance</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-group prepend-icon="md-security" no-action>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Security</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item to="/settings/security/password">
                <v-list-item-title>Password</v-list-item-title>
              </v-list-item>
              <v-list-item to="/settings/security/2fa">
                <v-list-item-title>Two factor auth</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-group prepend-icon="md-attach_money" no-action>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Billing</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item to="/settings/billing/invoices">
                <v-list-item-title>Invoices</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-group prepend-icon="md-code" no-action>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Developer</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item to="/settings/developer/webhooks">
                <v-list-item-title>Webhooks</v-list-item-title>
              </v-list-item>
              <v-list-item to="/settings/developer/api-keys">
                <v-list-item-title>API keys</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item to="/settings/teams">
              <v-list-item-icon>
                <v-icon>md-group</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Teams</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item to="/settings/teams/add">
              <v-list-item-icon>
                <v-icon>md-add</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Add a team</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>

      <!-- Main Content Area -->
      <v-col cols="12" md="9">
        <h1 class="text-h4 mb-4">Appearance</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          Manage settings for your booking appearance
        </p>

        <!-- Theme Selection -->
        <v-card class="mb-6">
          <v-card-title>Theme</v-card-title>
          <v-card-subtitle>This only applies to your public booking pages</v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4">
                <v-card
                  outlined
                  :class="{ 'theme-selected': theme === 'system' }"
                  @click="setTheme('system')"
                >
                  <v-img src="@/assets/system-theme.png" height="120"></v-img>
                  <v-card-text class="text-center">System default</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card
                  outlined
                  :class="{ 'theme-selected': theme === 'light' }"
                  @click="setTheme('light')"
                >
                  <v-img src="@/assets/light-theme.png" height="120"></v-img>
                  <v-card-text class="text-center">Light</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card
                  outlined
                  :class="{ 'theme-selected': theme === 'dark' }"
                  @click="setTheme('dark')"
                >
                  <v-img src="@/assets/dark-theme.png" height="120"></v-img>
                  <v-card-text class="text-center">Dark</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Custom Brand Colors -->
        <v-card class="mb-6">
          <v-card-title>Custom brand colors</v-card-title>
          <v-card-subtitle>Customize your own brand colour into your booking page.</v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="brandColorLight"
                  label="Brand Color (Light Theme)"
                  prefix="#"
                  :rules="[colorHexRule]"
                >
                  <template v-slot:prepend>
                    <v-btn small icon :color="`#${brandColorLight}`" style="border: 1px solid #ccc">
                      <v-icon>md-square</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="brandColorDark"
                  label="Brand Color (Dark Theme)"
                  prefix="#"
                  :rules="[colorHexRule]"
                >
                  <template v-slot:prepend>
                    <v-btn small icon :color="`#${brandColorDark}`" style="border: 1px solid #ccc">
                      <v-icon>md-square</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Disable Branding -->
        <v-card class="mb-6">
          <v-card-text>
            <v-row align="center">
              <v-col>
                <div>
                  <div class="text-h6">Disable FDM Monster branding</div>
                  <div class="text-subtitle-1 text-medium-emphasis">
                    Removes any FDM Monster related brandings, i.e. 'Powered by FDM Monster'
                  </div>
                </div>
              </v-col>
              <v-col cols="auto">
                <v-chip color="primary" small label>Pro</v-chip>
              </v-col>
              <v-col cols="auto">
                <v-switch v-model="disableBranding"></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Update Button -->
        <v-btn color="primary" large @click="saveSettings"> Update </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router/composables";

// Types
type Theme = "system" | "light" | "dark";

interface AppearanceSettings {
  theme: Theme;
  brandColorLight: string;
  brandColorDark: string;
  disableBranding: boolean;
}

// State
const theme = ref<Theme>("system");
const brandColorLight = ref("292929");
const brandColorDark = ref("fafafa");
const disableBranding = ref(false);

// Router
const router = useRouter();

// Validation
const colorHexRule = (value: string) => /^[0-9A-Fa-f]{6}$/.test(value) || "Invalid hex color";

// Methods
const setTheme = (newTheme: Theme) => {
  theme.value = newTheme;
};

const saveSettings = async () => {
  try {
    const settings: AppearanceSettings = {
      theme: theme.value,
      brandColorLight: brandColorLight.value,
      brandColorDark: brandColorDark.value,
      disableBranding: disableBranding.value,
    };

    // TODO: Implement API call to save settings
    console.log("Saving settings:", settings);
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};
</script>

<style scoped>
.theme-selected {
  border: 2px solid var(--v-primary-base) !important;
}

.v-list-item--active {
  background-color: #f5f5f5;
}

.v-navigation-drawer {
  position: relative !important;
  height: auto !important;
}
</style>
