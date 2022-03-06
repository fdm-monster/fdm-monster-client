import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vueErrorHandler } from './handlers/error.handler';

const app = createApp(App);
app.config.errorHandler = vueErrorHandler;

app.use(createPinia());
app.use(router);

app.mount('#app');
