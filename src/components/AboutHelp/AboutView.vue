<template>
  <v-container>
    <v-card>
      <v-card-title> About FDM Monster<strong>©</strong></v-card-title>
      <v-card-text>
        The first prototype of FDM Monster<strong>©</strong> was created by David Zwart in 2021 in
        collaboration with <strong><a href="https://mtb3d.com">MTB3D</a> </strong>. This open-source
        prototype proved a strong factor in process and logistics optimization for a 3D Printing
        company with 100+ printers. Due to it's success, we decided to keep it open-source and free!
      </v-card-text>
      <v-card-text>
        The latest 3D Printing Farm server named FDM Monster has been tested for 2 years using a
        custom image for running 4 OctoPrint images on a Raspberry Pi.
        <br />
        This version uses the famous
        <a href="https://nodejs.org/en" target="_blank">
          <strong>NodeJS framework</strong>
        </a>
        together with Awilix and ExpressJS for its server, and
        <a href="https://vuejs.org/" target="_blank"><strong>Vue 2</strong></a>
        and
        <a href="https://next.vuetifyjs.com/" target="_blank">
          <strong>Vuetify 2</strong>
        </a>
        to set a base for FDM Monster Client<strong>©</strong> - the webapp.
        <br />
        <br />
        <strong>Your server's version is: {{ serverVersion }}</strong>
        <br />
        <strong>Your clients's version is: {{ version }}</strong>
        <br />
        <strong v-if="monsterPiVersion"
          >Your MonsterPi version is: {{ monsterPiVersion }}<br />
        </strong>

        <br />
        <v-btn color="primary" @click="updateClientDist()"> Update Client</v-btn>
      </v-card-text>
      <v-card-title>
        Bug reports
        <v-icon>bug</v-icon>
      </v-card-title>
      <v-card-text>
        Did you find a bug, or a feature that needs work? We would love to hear about it! <br />

        <strong>We have multiple ways to report it:</strong>
        <h3>
          <ul class="ml-5">
            <li>Mail to davidzwa@gmail.com</li>
            <li>
              <a href="https://discord.gg/mwA8uP8CMc" style="color: white" target="_blank">
                Discord server
              </a>
            </li>
            <li>
              <strong>
                <a
                  href="https://github.com/fdm-monster/fdm-monster/issues"
                  style="color: white"
                  target="_blank"
                >
                  FDM Monster <strong>©</strong> Github Issues
                </a>
              </strong>
            </li>
            <li>
              <a href="https://fdm-monster.net" style="color: white" target="_blank"> Website </a>
            </li>
          </ul>
        </h3>
      </v-card-text>

      <v-card-title>About me</v-card-title>
      <v-card-text>
        <v-img src="/img/DavidZwart.jpg" width="150px"></v-img>
        <h4 class="mt-2">
          <a
            href="https://www.linkedin.com/in/david-zwart-88514083/"
            style="color: white"
            target="_blank"
          >
            LinkedIn
          </a>

          <a class="ml-2" href="https://github.com/davidzwa" style="color: white" target="_blank">
            Github Profile
          </a>
        </h4>
        David Zwart MSc., post-graduate from the TU Delft (Embedded Systems), author of FDM
        Monster<strong>© </strong>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AppService } from "../../backend/app.service";
import { version } from "../../../package.json";

export default defineComponent({
  name: "AboutView",
  components: {},
  setup: () => {
    return {
      serverVersion: ref(""),
      monsterPiVersion: ref<string | null>(""),
      version,
    };
  },
  async created() {},
  async mounted() {
    const versionSpec = await AppService.getVersion();
    this.serverVersion = versionSpec.version;
    this.monsterPiVersion = versionSpec.monsterPi;
  },
  props: {},
  computed: {},
  methods: {
    async updateClientDist() {
      if (!confirm("Are you sure? This might cause breaking changes, if the server is outdated"))
        return;

      console.debug("Updating client");
      await AppService.updateClientDist();
      location.reload();
    },
  },
  watch: {},
});
</script>
