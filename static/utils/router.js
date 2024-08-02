import Userhome from "../components/Userhome.js";
import Login from "../components/Login.js";
import Register from "../components/Register.js";
import Adminhome from "../components/Adminhome.js";
import SectionAdd from "../components/SectionAdd.js";

const routes = [
  { path: "/", component: Userhome },
  { path: "/admin", component: Adminhome },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/section/add", component: SectionAdd },
];

export default new VueRouter({
  routes,
});
