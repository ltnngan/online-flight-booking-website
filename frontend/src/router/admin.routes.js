import AdminLayout from "../views/admin/pages/AdminLayout.vue";
import Dashboard from "../views/admin/pages/Dashboard.vue";
import FlightList from "../views/admin/pages/FlightList.vue";
import FlightEdit from "../views/admin/pages/EditFlight.vue";
import FlightCreate from "../views/admin/pages/CreateFlight.vue";
import FlightRouteList from "../views/admin/pages/FlightRoute.vue";
import FlightRouteCreate from "../views/admin/pages/CreateFlightRoute.vue";
import UserManagement from "../views/admin/pages/UserList.vue";
import BookingManagement from "../views/admin/pages/BookingList.vue";
import Login from "../views/admin/pages/Login.vue";

// Navigation guard để kiểm tra đăng nhập
const requireAuth = (to, from, next) => {
  const adminData = localStorage.getItem("admin");

  if (!adminData) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    next({ name: "AdminLogin" });
  } else {
    // Nếu đã đăng nhập, cho phép vào trang
    next();
  }
};

const routes = [
  {
    path: "/admin",
    component: AdminLayout,
    beforeEnter: requireAuth, // Thêm guard cho tất cả route admin
    children: [
      {
        path: "/admin/dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "/admin/flights",
        name: "FlightList",
        component: FlightList,
      },
      {
        path: "/admin/flights/create",
        name: "FlightCreate",
        component: FlightCreate,
      },
      {
        path: "/admin/flights/edit/:id",
        name: "flightEdit",
        component: FlightEdit,
      },
      {
        path: "/admin/flight-routes/get",
        name: "FlightRouteList",
        component: FlightRouteList,
      },
      {
        path: "/admin/flight-routes/post",
        name: "FlightRouteCreate",
        component: FlightRouteCreate,
      },
      {
        path: "/admin/user",
        name: "UserManagement",
        component: UserManagement,
      },
      {
        path: "/admin/booking",
        name: "BookingManagement",
        component: BookingManagement,
      },
    ],
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: Login,
    beforeEnter: (to, from, next) => {
      // Nếu đã đăng nhập rồi và cố gắng vào trang login
      const adminData = localStorage.getItem("admin");
      if (adminData) {
        // Chuyển hướng về dashboard
        next({ path: "/admin" });
      } else {
        next();
      }
    },
  },
  // Thêm route mặc định để chuyển hướng đến /admin
  {
    path: "/",
    redirect: "/admin",
  },
];

export default routes;
