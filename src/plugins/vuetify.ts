// Styles
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import "vuetify/styles";
import { aliases, md } from 'vuetify/lib/iconsets/md'

// Vuetify
import {createVuetify} from "vuetify";

export default createVuetify(
    // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
    {
        icons: {
            defaultSet: "md",
            aliases,
            sets: {
                md,
            },
        },
  }
);
