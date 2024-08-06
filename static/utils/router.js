// Access Vue and VueRouter from the global window object
const Vue = window.Vue;
const VueRouter = window.VueRouter;

// Import components
import Userhome from "../components/Userhome.js";
import Login from "../components/Login.js";
import Register from "../components/Register.js";
import Adminhome from "../components/Adminhome.js";
import SectionAdd from "../components/section/AddSection.js";
import EditSection from "../components/section/EditSection.js";
import DeleteSection from "../components/section/DeleteSection.js";
import ShowSection from "../components/section/ShowSection.js";
import AddBook from "../components/AddBook.js";
import EditBook from "../components/EditBook.js";
import ShowBook from "../components/ShowBook.js";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/adminhome",
    component: Adminhome,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/userhome",
    component: Userhome,
    meta: { requiresAuth: true, role: "user" },
  },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  {
    path: "/section/add",
    component: SectionAdd,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/section/:id/edit",
    component: EditSection,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/section/:id/delete",
    component: DeleteSection,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/section/:id/show",
    component: ShowSection,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/book/add",
    component: AddBook,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/api/book/:id/edit",
    component: EditBook,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/api/book/:id/show",
    component: ShowBook,
  },
];

const router = new VueRouter({ routes });

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!sessionStorage.getItem("access_token");
  const userRole = sessionStorage.getItem("role");

  if (to.meta.requiresAuth && !isLoggedIn) {
    next(false);
  } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
    next(false); // Or redirect to a specific unauthorized page
  } else {
    next();
  }
});

export default router;
