  import axiosClient from "./api.service";

  const flightAPI = {
    searchFlights(searchParams) {
      return axiosClient.get("/flights/search", {
        params: {
          from: searchParams.from,
          to: searchParams.to,
          date: searchParams.date,
          returnDate: searchParams.returnDate,
          tripType: searchParams.tripType,
          adults: searchParams.adults,
          children: searchParams.children,
        },
      });
    },

    getMyFlightsGuest(bookingCode, contactName) {
      return axiosClient.post("/flights/my-flights", {
        bookingCode,
        contactName,
      });
    },

    getCheapFlights() {
      return axiosClient.get("/flights/cheap-flights");
    },
  };

  export default flightAPI;