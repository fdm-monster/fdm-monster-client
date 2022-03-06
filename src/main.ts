import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'
import { vueErrorHandler } from './handlers/error.handler';

loadFonts()

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify);

app.config.errorHandler = vueErrorHandler;
app.mount('#app');