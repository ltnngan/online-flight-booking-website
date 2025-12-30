const calculateFlightPrices = (flight, seat) => {
    const daysUntilDeparture = Math.ceil((new Date(flight.date) - new Date()) / (1000 * 60 * 60 * 24));
    const adjustedBasePrice = daysUntilDeparture < 3 ? flight.basePrice * 1.2 : flight.basePrice;

    return adjustedBasePrice * seat.priceMultiplier;
}

module.exports = { calculateFlightPrices };