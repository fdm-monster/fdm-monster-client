import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "@fontsource/roboto";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    dark: true,
    themes: {
      dark: {
        primary: "#9B0505",
        secondary: "#424242",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107",
      },
      light: {
        primary: "#9B0505",
        secondary: "#424242",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107",
      },
    },
  },
  icons: {
    iconfont: "md",
    values: {
      octoprint: "directions",
    },
  },
});
