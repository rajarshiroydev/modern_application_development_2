// Access Vue and VueRouter from the global window object
const Vue = window.Vue;
const VueRouter = window.VueRouter;

import Navbar from "../components/Navbar.js";
import router from "./router.js";

Vue.use(VueRouter);

router.beforeEach((to, from, next) => {
  if (
    to.name !== "Login" && !sessionStorage.getItem("access_token")
      ? true
      : false
  )
    next({ name: "Login" });
  else next();
});

new Vue({
  el: "#app",
  components: {
    Navbar,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed;
    },
  },
  template: `
    <div>
      <Navbar :key='has_changed'/>
      <router-view/>
    </div>`,
  router,
});
