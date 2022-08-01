import { SchemaFormWithValidation } from "@/plugins/veevalidate";

export function getTestConfig(vuetify: any) {
  return {
    global: {
      plugins: [vuetify, createPinia()],
      components: { SchemaFormWithValidation },
    },
    props: {},
  };
}
