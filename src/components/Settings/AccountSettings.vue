<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>account_circle</v-icon>
      </v-avatar>
      <v-toolbar-title>Account Settings</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Username</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.username" disabled label="username" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <br />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Old Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.oldPassword" disabled label="oldPassword" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> New Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.newPassword" disabled label="oldPassword" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Repeat New Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.repeatPassword" disabled label="repeatPassword" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-content>
    </v-list>
    <v-divider />
  </v-card>
</template>

<script lang="ts" setup>
import { useProfileStore } from "@/store/profile.store";
import { onMounted, ref } from "vue";
import { UserService } from "@/backend/user.service";
import { useSnackbar } from "@/shared/snackbar.composable";

const profileStore = useProfileStore();
const userId = ref<string>("");
const formData = ref<{
  username: string;
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
}>({ username: "", newPassword: "", oldPassword: "", repeatPassword: "" });

onMounted(async () => {
  await profileStore.getProfile();
  formData.value.username = profileStore.username as string;
  userId.value = profileStore.userId as string;
});

async function changeUsername() {
  if (!userId.value?.length) {
    useSnackbar().openErrorMessage({ title: "User not loaded" });
    return;
  }
  await UserService.changeUsername(userId.value, formData.value.username);
  formData.value.username = "";
}

async function changePassword() {
  if (!userId.value?.length) {
    useSnackbar().openErrorMessage({ title: "User not loaded" });
    return;
  }
  if (formData.value.oldPassword !== formData.value.repeatPassword) {
    useSnackbar().openErrorMessage({ title: "Passwords do not match" });
    return;
  }
  await UserService.changePassword(
    userId.value,
    formData.value.oldPassword,
    formData.value.newPassword
  );
  formData.value.oldPassword = "";
  formData.value.repeatPassword = "";
}
</script>
