import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Register from "../pages/Register.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
];

const router = new VueRouter({
  routes,
});

export default router;
