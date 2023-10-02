<template>
  <v-container>
    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08"
    />
    <v-stepper v-model="e1" class="grey darken-4">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1"> Login and registration</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2"> Introduction</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3"> Summary</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-form v-model="formValid">
            <v-switch class="mt-5" v-model="formStep1.loginRequired" :hint="true" persistent-hint>
              <template v-slot:message>
                <v-icon
                  :color="formStep1.loginRequired ? 'success' : ''"
                  :disabled="!formStep1.loginRequired"
                >
                  check
                </v-icon>
                Login is required.
                <br />
                <v-icon
                  :color="!formStep1.loginRequired ? 'error' : ''"
                  :disabled="formStep1.loginRequired"
                >
                  close
                </v-icon>
                No login is required. The admin role is assumed.
              </template>
              <template v-slot:label>Enable Login</template>
            </v-switch>

            <v-alert v-if="!formStep1.loginRequired" color="error darken-4 mt-2">
              You might be exposing your FDM Monster server publicly. Please take care evaluating
              the
              <strong>Enable Login</strong> option.
            </v-alert>

            <v-switch
              class="mt-10 mb-10"
              v-model="formStep1.registration"
              :hint="true"
              persistent-hint
            >
              <template v-slot:message>
                <v-icon
                  :color="formStep1.registration ? 'success' : ''"
                  :disabled="!formStep1.registration"
                >
                  check
                </v-icon>
                <span>Accounts can be registered using guest role.</span>
                <br />
                <v-icon
                  :color="!formStep1.registration ? 'error' : ''"
                  :disabled="formStep1.registration"
                >
                  close
                </v-icon>
                No other accounts can be registered.
              </template>
              <template v-slot:label>Enable Registration</template>
            </v-switch>

            <v-divider />

            <v-text-field
              class="mt-5"
              label="Username"
              v-model="formStep2.rootUsername"
              :rules="[(v) => !!v || 'Username is required']"
            >
              <template v-slot:prepend>
                <v-icon>person</v-icon>
              </template>
            </v-text-field>

            <v-text-field
              class="mt-5"
              label="Password"
              v-model="formStep2.rootPassword"
              :rules="[(v) => !!v || 'Password is required']"
            >
              <template v-slot:prepend>
                <v-icon>password</v-icon>
              </template>
            </v-text-field>

            <v-text-field
              class="mt-5"
              label="Repeated Password"
              v-model="formStep2.rootPassword2"
              :rules="[
                (v) => !!v || 'Repeated password is required',
                (v) => v === formStep2.rootPassword || 'Passwords are not equal',
              ]"
            >
              <template v-slot:prepend>
                <v-icon>password</v-icon>
              </template>
            </v-text-field>
          </v-form>
          <v-divider class="mt-4"></v-divider>

          <v-btn class="mt-4" color="primary" @click="e1 = 2" :disabled="!formValid">
            Verify & Submit
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

          <v-btn color="primary" @click="e1 = 1"> Continue</v-btn>

          <v-btn text> Cancel</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>
<script lang="ts" setup>
import { ref } from "vue";

const formValid = ref(false);
const formStep1 = ref({
  loginRequired: true,
  registration: false,
});
const formStep2 = ref({
  rootUsername: "",
  rootPassword: "",
  rootPassword2: "",
});

const e1 = ref(1);
</script>
