import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vuetify/styles";
import { aliases, md } from "vuetify/lib/iconsets/md";
import { createVuetify } from "vuetify";
import type { ThemeDefinition } from "vuetify/dist/vuetify";

const myCustomLightTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#121212",
    surface: "#1e1e1e",
    primary: "#9B0505",
    "primary-darken-1": "#9B0505",
    secondary: "#2a2a2a",
    "secondary-darken-1": "#018786",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FFC107",
  },
};
export default createVuetify(
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  {
    theme: {
      defaultTheme: "myCustomLightTheme",
      dark: true,
      themes: {
        myCustomLightTheme,
      },
    },
    icons: {
      defaultSet: "md",
      aliases,
      sets: {
        md,
      },
    },
  }
);
