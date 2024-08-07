// Access Vue and VueRouter from the global window object
const Vue = window.Vue;
const VueRouter = window.VueRouter;

// Import components
import Userhome from "../components/Userhome.js";
import Login from "../components/Login.js";
import Register from "../components/Register.js";
import Adminhome from "../components/section/Adminhome.js";
import SectionAdd from "../components/section/AddSection.js";
import EditSection from "../components/section/EditSection.js";
import DeleteSection from "../components/section/DeleteSection.js";
import ShowSection from "../components/section/ShowSection.js";
import AddBook from "../components/book/AddBook.js";
import EditBook from "../components/book/EditBook.js";
import ShowBook from "../components/book/ShowBook.js";
import UserRequests from "../components/UserRequests.js";
import Library from "../components/Library.js";
import Issued from "../components/Issued.js";
import GiveFeedbacks from "../components/GiveFeedbacks.js";

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
  {
    path: "/requests",
    component: UserRequests,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/issued_books_user",
    component: Library,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/issued_books",
    component: Issued,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/give_feedbacks_data/:id",
    component: GiveFeedbacks,
    meta: { requiresAuth: true, role: "user" },
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
