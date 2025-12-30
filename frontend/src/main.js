import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import "@fortawesome/fontawesome-free/css/all.min.css";

import setupInterceptorsClient from "./services/client/setupInterceptors";
setupInterceptorsClient();

import setupInterceptorsAdmin from "./services/admin/setupInterceptors"
setupInterceptorsAdmin()

import checkTokenOnStartupClient from './utils/checkTokenOnStartupClient';
checkTokenOnStartupClient(); // Kiểm tra token trước khi mount app

import checkTokenOnStartupAdmin from "./utils/checkTokenOnStartupAdmin"
checkTokenOnStartupAdmin()

const app = createApp(App);
app.use(router);
app.mount("#app");
