import Userhome from "../components/Userhome.js";
import Login from "../components/Login.js";
import Register from "../components/Register.js";
import Adminhome from "../components/Adminhome.js";

const routes = [
  { path: "/", component: Userhome },
  { path: "/admin", component: Adminhome },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
];

export default new VueRouter({
  routes,
});
