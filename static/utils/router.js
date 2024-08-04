import Userhome from "../components/Userhome.js";
import Login from "../components/Login.js";
import Register from "../components/Register.js";
import Adminhome from "../components/Adminhome.js";
import SectionAdd from "../components/SectionAdd.js";
import EditSection from "../components/section/EditSection.js";
import DeleteSection from "../components/section/DeleteSection.js";

const routes = [
  { path: "/", component: Userhome },
  { path: "/admin", component: Adminhome },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/section/add", component: SectionAdd },
  { path: "/section/:id/edit", component: EditSection },
  { path: "/section/:id/delete", component: DeleteSection },
];

export default new VueRouter({
  routes,
});
