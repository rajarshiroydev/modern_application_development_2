import router from "./router.js";
import Navbar from "../components/Navbar.js";

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
