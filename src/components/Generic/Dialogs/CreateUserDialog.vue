<template>
  <BaseDialog
    :id="dialog.dialogId"
    :max-width="'700px'"
    @beforeOpened="onBeforeDialogOpened()"
    @escape="closeDialog()"
    @opened="onDialogOpened()"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">
          <v-avatar color="primary" size="56">{{ avatarInitials }}</v-avatar>
          <span class="pl-5">
            New verified User

            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn class="ma-2" fab v-bind="attrs" x-small v-on="on">
                  <v-icon>question_mark</v-icon>
                </v-btn>
              </template>
              <template v-slot:default>
                The user will be set to verified and assigned roles. Please share the username and
                password with them manually.
              </template>
            </v-tooltip>
          </span>
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.username"
                    :rules="[rules.required, rules.minLength]"
                    autofocus
                    label="Username*"
                    prepend-icon="person"
                    required
                  />
                  <v-text-field
                    v-model="formData.password"
                    :rules="[rules.required, rules.password]"
                    label="Password*"
                    prepend-icon="lock"
                    required
                    type="password"
                  />
                  <v-text-field
                    v-model="passwordConfirm"
                    :rules="[rules.required, rules.passwordMatch]"
                    label="Confirm Password*"
                    prepend-icon="lock"
                    required
                    type="password"
                  />
                  <v-select
                    v-model="formData.roleIds"
                    :items="roles.map((r) => ({ text: r.name, value: r.id }))"
                    :rules="[rules.required]"
                    label="Roles*"
                    multiple
                    prepend-icon="shield"
                    required
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <em class="text-red"> * indicates required field </em>
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Close</v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="submit">Create</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { UserService } from "@/backend/user.service";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { AppConstants } from "@/shared/app.constants";
import { useSnackbar } from "@/shared/snackbar.composable";
import { IdType } from "@/utils/id.type";
import { Role } from "@/models/user.model";

interface CreateUserForm {
  username: string;
  password: string;
  roleIds: IdType[];
}

const dialog = useDialog(DialogName.CreateUserDialog);
const appConstants = inject("appConstants") as AppConstants;
const snackbar = useSnackbar();

const formData = ref<CreateUserForm>({
  username: "",
  password: "",
  roleIds: [],
});

const passwordConfirm = ref("");
const roles = ref<Role[]>([]);

function onBeforeDialogOpened() {}

async function onDialogOpened() {
  try {
    roles.value = await UserService.listRoles();
  } catch (error) {
    snackbar.openErrorMessage({
      title: "Failed to load roles",
      subtitle: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

const avatarInitials = computed(() => {
  return formData.value?.username?.length ? generateInitials(formData.value.username) : "??";
});

const rules = {
  required: (value: string) => !!value || "Required field",
  minLength: (value: string) =>
    value.length >= appConstants.minUsernameLength ||
    `Minimum ${appConstants.minUsernameLength} characters`,
  password: (value: string) => {
    const hasMinLength = value.length >= 8;

    if (!hasMinLength) return "Password must be at least 8 characters";

    return true;
  },
  passwordMatch: (value: string) => value === formData.value.password || "Passwords must match",
};

const validateFormData = () => {
  if (!formData.value.username || formData.value.username.length < appConstants.minUsernameLength) {
    snackbar.openErrorMessage({ title: "Invalid username" });
    return false;
  }
  if (!formData.value.password || rules.password(formData.value.password) !== true) {
    snackbar.openErrorMessage({ title: "Invalid password" });
    return false;
  }
  if (formData.value.password !== passwordConfirm.value) {
    snackbar.openErrorMessage({ title: "Passwords do not match" });
    return false;
  }
  if (!formData.value.roleIds.length) {
    snackbar.openErrorMessage({ title: "Please select a role" });
    return false;
  }
  return true;
};

const submit = async () => {
  if (!validateFormData()) return;
  try {
    await UserService.createUser(formData.value);
    snackbar.openInfoMessage({
      title: `User ${formData.value.username} created successfully`,
    });
    closeDialog();
  } catch (error) {
    snackbar.openErrorMessage({
      title: "Failed to create user",
      subtitle: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const closeDialog = () => {
  formData.value = {
    username: "",
    password: "",
    roleIds: [],
  };
  passwordConfirm.value = "";
  dialog.closeDialog();
};
</script>
