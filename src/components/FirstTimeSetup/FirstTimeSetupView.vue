<template>
  <v-container>
    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08"
    />
    <v-stepper v-model="stepper" class="grey darken-4">
      <v-stepper-header>
        <v-stepper-step :complete="stepper > 1" step="1"> Introduction</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="stepper > 2" step="2"> Login and registration</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3"> Summary</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content class="align-content-center align-center text-center" step="1">
          <div class="align-content-center align-center text-center">
            <img class="rounded-pill ma-4" src="/img/OIG.jpg" style="opacity: 0.7" width="400" />
            <h1>FDM Monster</h1>
            <small>This server is still unconfigured..</small>
          </div>
          <v-btn class="mt-14 mb-14" color="primary" @click="stepper = 2">Start Setup</v-btn>

          <div class="mt-6 border_all">
            <v-icon class="mr-6">question_mark</v-icon>
            <small>
              If you have questions at any point, reach out on
              <a href="https://github.com/fdm-monster/fdm-monster/issues">Github</a> or on
              <a href="https://discord.gg/mwA8uP8CMc">Discord</a>.</small
            >
          </div>
        </v-stepper-content>
        <v-stepper-content class="align-content-center align-center text-center" step="2">
          <h4><v-icon class="mr-2">settings</v-icon> Login</h4>

          <v-form v-model="formValid">
            <v-switch v-model="formStep1.loginRequired" :hint="true" class="mt-5" persistent-hint>
              <template v-slot:message>
                <span class="d-flex flex-row align-center">
                  <v-icon
                    :color="formStep1.loginRequired ? 'success' : ''"
                    :disabled="!formStep1.loginRequired"
                    class="ml-3 mr-3"
                  >
                    check
                  </v-icon>
                  Login is required.
                </span>

                <span class="d-flex flex-row align-center">
                  <v-icon
                    :color="!formStep1.loginRequired ? 'error' : ''"
                    :disabled="formStep1.loginRequired"
                    class="ml-3 mr-3"
                  >
                    close
                  </v-icon>
                  No login is required. The admin role is assumed.
                </span>
              </template>
              <template v-slot:label>Enable Login</template>
            </v-switch>

            <v-alert v-if="!formStep1.loginRequired" color="error darken-4 mt-4">
              You might be exposing your FDM Monster server publicly. Please take care evaluating
              the
              <strong>Enable Login</strong> option.
            </v-alert>

            <v-switch
              v-model="formStep1.registration"
              :hint="true"
              class="mt-10 mb-10"
              persistent-hint
            >
              <template v-slot:message>
                <span class="d-flex flex-row align-center">
                  <v-icon
                    :color="formStep1.registration ? 'success' : ''"
                    :disabled="!formStep1.registration"
                    class="ml-3 mr-3"
                  >
                    check
                  </v-icon>
                  Accounts can be registered with a guest role.
                </span>
                <span class="d-flex flex-row align-center">
                  <v-icon
                    :color="!formStep1.registration ? 'error' : ''"
                    :disabled="formStep1.registration"
                    class="ml-3 mr-3"
                  >
                    close
                  </v-icon>
                  No other accounts can be registered.
                </span>
              </template>
              <template v-slot:label>Enable Registration</template>
            </v-switch>

            <v-divider />

            <h4 class="mt-4"><v-icon class="mr-2">shield</v-icon> Admin account</h4>

            <v-text-field
              v-model="formStep2.rootUsername"
              :rules="[(v) => !!v || 'Username is required']"
              class="mt-5"
              label="Username"
              prepend-icon="person"
            >
              <template v-slot:prepend>
                <v-icon>person</v-icon>
              </template>
            </v-text-field>

            <v-text-field
              v-model="formStep2.rootPassword"
              type="password"
              prepend-icon="lock"
              :rules="[
                (v) => !!v || 'Password is required',
                (v) => (!!v && v?.length >= 8) || 'Password must be of length 8 or greater',
              ]"
              class="mt-5"
              label="Password"
            >
              <template v-slot:prepend>
                <v-icon>password</v-icon>
              </template>
            </v-text-field>

            <v-text-field
              v-model="formStep2.rootPassword2"
              type="password"
              prepend-icon="lock"
              :rules="[
                (v) => !!v || 'Repeated password is required',
                (v) => v === formStep2.rootPassword || 'Passwords are not equal',
              ]"
              class="mt-5"
              label="Repeated Password"
            >
              <template v-slot:prepend>
                <v-icon>password</v-icon>
              </template>
            </v-text-field>
          </v-form>

          <div class="mt-4">
            <v-btn class="mr-4" @click="stepper = 1">Back</v-btn>
            <v-btn :disabled="!formValid" color="primary" @click="submitWizard()">
              Verify & Submit</v-btn
            >
          </div>

          <v-divider class="mt-4" />

          <div class="mt-14">
            <v-icon class="mr-6">question_mark</v-icon>
            <small>
              If you have questions at any point, reach out on
              <a href="https://github.com/fdm-monster/fdm-monster/issues">Github</a> or on
              <a href="https://discord.gg/mwA8uP8CMc">Discord</a>.</small
            >
          </div>
        </v-stepper-content>
        <v-stepper-content class="align-content-center align-center text-center" step="3">
          <div class="mb-5 mt-10">
            <v-icon size="100" class="mr-5" color="green circle">check_circle</v-icon> Setup
            Completed
          </div>

          <br />
          <v-btn color="primary" class="mr-4" @click="continueNext()">Let's continue</v-btn>

          <div class="mt-14">
            <v-icon class="mr-6">question_mark</v-icon>
            <small>
              If you have questions at any point, reach out on
              <a href="https://github.com/fdm-monster/fdm-monster/issues">Github</a> or on
              <a href="https://discord.gg/mwA8uP8CMc">Discord</a>.</small
            >
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { FirstTimeSetupService } from "@/backend/first-time-setup.service";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useRouter } from "vue-router/composables";

const router = useRouter();
const snackbar = useSnackbar();
const formValid = ref(false);
const formStep1 = ref({
  loginRequired: true,
  registration: false,
});
const formStep2 = ref({
  rootUsername: "admin",
  rootPassword: "",
  rootPassword2: "",
});

const stepper = ref(1);

async function submitWizard() {
  if (!formValid.value) {
    snackbar.error("Please fill out all required fields.");
    return;
  }

  const formValue = formStep1.value;
  const form2Value = formStep2.value;
  await FirstTimeSetupService.postFirstTimeSetup({
    loginRequired: formValue.loginRequired,
    registration: formValue.registration,
    rootUsername: form2Value.rootUsername,
    rootPassword: form2Value.rootPassword,
  });
  snackbar.openInfoMessage({ title: "Setup completed" });
  stepper.value = 3;
}

async function continueNext() {
  await router.push({ name: "Login" });
}
</script>
<style>
.typewriter h1 {
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  border-right: 0.15em solid orange; /* The typwriter cursor */
  white-space: nowrap; /* Keeps the content on a single line */
  //margin: 0 auto; /* Gives that scrolling effect as the typing happens */ letter-spacing: 0.15em; /* Adjust as needed */
  animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
}

/* The typing effect */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* The typewriter cursor effect */
@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: orange;
  }
}
</style>
