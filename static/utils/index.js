// Access Vue and VueRouter from the global window object
const Vue = window.Vue;
const VueRouter = window.VueRouter;

// Import components
import Navbar from "../components/Navbar.js";

// Define routes and router
import router from "./router.js";

Vue.use(VueRouter);

new Vue({
  el: "#app",
  components: { Navbar },
  template: `
    <div>
      <Navbar/>
      <router-view/>
    </div>`,
  router,
});
