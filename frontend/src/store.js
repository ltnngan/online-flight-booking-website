// store.js (để chia sẻ dữ liệu giữa các route)
import { reactive } from "vue";

export const store = reactive({
  searchParams: {
    from: "",
    to: "",
    date: "",
    returnDate: "",
    tripType: "oneway",
    adults: 1,
    children: 0,
  },
  flightResults: null,
  selectedOutboundFlight: null,
  selectedOutboundSeat: null,
  selectedReturnFlight: null,
  selectedReturnSeat: null,
  bookingInfo: null,
  passengerDetails: [],
  contactInfo: {
    name: "",
    phone: "",
    email: "",
  },
});
