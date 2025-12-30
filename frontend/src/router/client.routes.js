import Home from "../../src/views/client/pages/Home.vue";
import FlightSelection from "../../src/views/client/pages/FlightSelection.vue";
import ReturnFlightSelection from "../../src/views/client/pages/ReturnFlightSelect.vue";
import BookingInformation from "../../src/views/client/pages/BookingInformation.vue";
import BookingConfirmation from "../../src/views/client/pages/BookingConfirmation.vue";
import Login from "../../src/views/client/pages/Login.vue";

// import Login from "../views/client/pages/Login.vue";
import Register from "../views/client/pages/Register.vue";

import Account from "../views/client/pages/MyAccount.vue";
import MyFlightsGuest from "../views/MyFlightsGuest.vue";

// import Login from "../views/Login.vue";
// import Register from "../views/Register.vue";

const clientRoutes = [
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/select-flight",
    name: "FlightSelection",
    component: FlightSelection,
  },
  {
    path: "/select-return-flight",
    name: "ReturnFlightSelection",
    component: ReturnFlightSelection,
  },
  {
    path: "/booking-information",
    name: "BookingInformation",
    component: BookingInformation,
  },
  {
    path: "/booking-confirmation",
    name: "BookingConfirmation",
    component: BookingConfirmation,
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
  },
  {
    path: "/my-flights",
    name: "MyFlightsGuest",
    component: MyFlightsGuest,
  },
];

export default clientRoutes;