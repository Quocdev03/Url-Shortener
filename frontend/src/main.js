import "./style.css";
import "vue3-toastify/dist/index.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast from "vue3-toastify";
import App from "./App.vue";
import router from "./router/index.js";

const app = createApp(App);
app.use(createPinia());
app.use(Toast);
app.use(router);
app.mount("#app");
