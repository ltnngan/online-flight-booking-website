<template>
    <div class="flight-selection">
        <AppHeader />
        <div class="flight-selection_container">
            <div class="flight-selection_info">
                <div class="flight-selection_type">
                    <p v-if="searchParams.tripType === 'roundtrip'" style="font-weight: bold;">Chuyến bay khứ hồi</p>
                    <p v-if="searchParams.tripType === 'oneway'" style="font-weight: bold;">Chuyến bay thẳng</p>
                    <div class="info-divider"></div>
                </div>
                <p><strong>Từ:</strong> {{ searchParams.from }}</p>
                <p><strong>Đến:</strong> {{ searchParams.to }}</p>
                <p><strong>Chuyến đi:</strong> {{ searchParams.date }}</p>
                <p v-if="searchParams.tripType === 'roundtrip'"><strong>Chuyến về:</strong> {{ searchParams.returnDate }}</p>
                <p>
                    <strong>Người lớn:</strong> {{ searchParams.adults }} - 
                    <strong>Trẻ em:</strong> {{ searchParams.children }}
                </p>
            </div>

            <div class="flight-selection_banner">
                <img src="/Banner-phu2.png" alt="Banner" class="banner-image">
                <div class="banner-overlay">
                    <h2 class="banner-title">CHỌN CHUYẾN BAY VỀ</h2>
                    <p class="banner-route">{{ searchParams.to }} đến {{ searchParams.from }}</p>
                </div>
            </div>

            <div class="selected-outbound">
                <div class="outbound-info">
                    <p><strong> {{ outboundFlight.fromCity }} đến {{ outboundFlight.toCity }}</strong> - {{ formatDate(outboundFlight.date) }}</p>
                    <p> {{ outboundFlight.flightCode }} - {{ outboundFlight.seatType }} - {{ formatPrice(outboundFlight.price) }} VND </p>
                </div>
                <div class="divider"></div>
                <div class="flight-schedule">
                    <div class="departure-details">
                        <p style="font-size: 1.8rem;">{{ outboundFlight.time }}</p>
                        <p style="color: #003366;">{{ outboundFlight.fromCity }}</p>
                    </div>
                    <div class="flight-duration">
                        <p>✈ Bay thẳng - {{ outboundFlight.duration }}</p>
                        <div class="duration-extra"></div>
                    </div>
                    <div class="arrival-details">
                        <p style="font-size: 1.8rem;">{{ calculateArrivalTime(outboundFlight.time, outboundFlight.duration) }}</p>
                        <p style="color: #003366;">{{ outboundFlight.toCity }}</p>
                    </div>
                </div>
            </div>

            <div class="flight-selection_list">
                <div v-if="flightResults.returnFlight && flightResults.returnFlight.length > 0" class="flight-results">
                    <div v-for="flight in flightResults.returnFlight" :key="flight._id" class="flight-item" :class="{ 'selected-flight': selectedFlight && selectedFlight._id === flight._id }">
                        <div class="flight-info">
                            <div class="flight-route">
                                <div class="flight-line">
                                    <span class="plane-icon">✈</span>
                                </div>
                                <p><strong></strong> {{ flight.flightCode }}</p>
                                <p><strong></strong> {{ flight.fromCity }} → {{ flight.toCity }}</p>
                            </div>
                            <div class="flight-details">
                                <p><strong>Ngày:</strong> {{ formatDate(flight.date) }}</p>
                                <p><strong>Giờ khởi hành:</strong> {{ flight.time }}</p>
                                <p><strong>Giờ đến:</strong> {{ calculateArrivalTime(flight.time, flight.duration) }}</p>
                                <p><strong>Thời gian bay:</strong> {{ flight.duration }}</p>
                            </div>
                        </div>
                        <div class="seat-options">
                            <label 
                                v-for="seat in flight.seats" 
                                :key="seat.category" 
                                class="seat-option"
                                :data-category="seat.category"
                                :class="{ 'selected': selectedFlight && selectedFlight._id === flight._id && selectedSeat === seat.category }"
                            >
                                <input 
                                    type="radio" 
                                    :name="'seat'" 
                                    :value="seat.category" 
                                    :checked="selectedFlight && selectedFlight._id === flight._id && selectedSeat === seat.category"
                                    @change="selectFlight(flight, seat.category)"
                                >
                                <div class="seat-info">
                                    <span>{{ seat.category }}</span>
                                    <span>{{ formatPrice(seat.price) }} VND</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div v-else class="no-results">
                    Không tìm thấy chuyến bay nào phù hợp.
                </div>
            </div>
        </div>
        <div class="button-group">
            <button @click="goBackToOutbound" class="back-btn">Quay lại chọn chuyến bay đi</button>
            <button 
                v-if="selectedFlight" 
                @click="continueBooking" 
                class="continue-btn"
                :disabled="!selectedSeat"
            >
                Tiếp tục
            </button>
        </div>
    </div>
</template>

<script>
import AppHeader from "../../../components/client/AppHeader.vue";

export default {
    components: {
        AppHeader
    },

    data() {
        return {
            searchParams: {},
            outboundFlight: {},
            flightResults: null,
            selectedSeat: '',
            selectedFlight: null,
            selectedFlightId: null,
        }
    },

    created() {
        this.searchParams = JSON.parse(sessionStorage.getItem('searchParams') || '{}');
        this.flightResults = JSON.parse(sessionStorage.getItem('flightResults') || '{}');
        this.outboundFlight = JSON.parse(sessionStorage.getItem('outboundFlight') || '{}');

        const savedState = sessionStorage.getItem('returnFlightSelectionState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.selectedSeat = state.selectedSeat || '';
            this.selectedFlight = state.selectedFlight || null;
            this.selectedFlightId = state.selectedFlight ? state.selectedFlight._id : null;
        }

        if (!this.searchParams.from || !this.outboundFlight._id || !this.flightResults) {
            this.$router.push({ name: 'FlightSelection' });
        }
    },

    methods: {
        selectFlight(flight, seatCategory) {
            if (seatCategory) {
                this.selectedFlight = flight;
                this.selectedFlightId = flight._id;
                this.selectedSeat = seatCategory;
                const selectedSeatData = flight.seats.find(seat => seat.category === seatCategory);
                if (selectedSeatData) {
                    this.selectedFlight.selectedPrice = selectedSeatData.price;
                }
            } else {
                this.selectedFlight = null;
                this.selectedFlightId = null;
                this.selectedSeat = '';
            }
            this.saveToSessionStorage();
        },

        goBackToOutbound() {
            this.saveToSessionStorage();
            this.$router.push({ name: 'FlightSelection' });
        },

        continueBooking() {
            if (!this.selectedFlight || !this.selectedSeat) {
                return;
            }
            
            const returnFlight = {
                flightCode: this.selectedFlight.flightCode,
                fromCity: this.selectedFlight.fromCity,
                toCity: this.selectedFlight.toCity,
                date: this.selectedFlight.date,
                time: this.selectedFlight.time, 
                duration: this.selectedFlight.duration,
                seatType: this.selectedSeat,
                price: this.selectedFlight.selectedPrice,
                _id: this.selectedFlight._id
            };

            const bookingInfo = {
                outbound: this.outboundFlight,
                return: returnFlight
            };
            
            sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
            
            this.$router.push({ name: 'BookingInformation' });
        },
        
        saveToSessionStorage() {
            const state = {
                selectedSeat: this.selectedSeat,
                selectedFlight: this.selectedFlight ? {
                    flightCode: this.selectedFlight.flightCode,
                    fromCity: this.selectedFlight.fromCity,
                    toCity: this.selectedFlight.toCity,
                    date: this.selectedFlight.date,
                    time: this.selectedFlight.time,
                    duration: this.selectedFlight.duration,
                    seats: this.selectedFlight.seats,
                    selectedPrice: this.selectedFlight.selectedPrice,
                    _id: this.selectedFlight._id
                } : null
            };
            try {
                sessionStorage.setItem('returnFlightSelectionState', JSON.stringify(state));
            } catch (e) {
                console.error('Error saving to sessionStorage:', e);
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date)) return 'Ngày không hợp lệ';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        
        formatPrice(price) {
            if (!price) return '0';
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        
        calculateArrivalTime(departureTime, duration) {
            if (!departureTime || !duration) return 'N/A';

            const [depHours, depMinutes] = departureTime.split(':').map(Number);
            let totalDepMinutes = depHours * 60 + depMinutes;

            const durationMatch = duration.match(/(\d+)h(\d*)/);
            if (!durationMatch) return 'N/A';
            const durationHours = parseInt(durationMatch[1]) || 0;
            const durationMinutes = parseInt(durationMatch[2]) || 0;
            const totalDurationMinutes = durationHours * 60 + durationMinutes;

            let totalMinutes = totalDepMinutes + totalDurationMinutes;

            let arrivalHours = Math.floor(totalMinutes / 60) % 24;
            let arrivalMinutes = totalMinutes % 60;

            arrivalHours = String(arrivalHours).padStart(2, '0');
            arrivalMinutes = String(arrivalMinutes).padStart(2, '0');

            return `${arrivalHours}:${arrivalMinutes}`;
        },
    }
}
</script>

<style scoped>
.flight-selection_info {
    background-color: #f5f7fa;
    display: flex;
    justify-content: center;
    gap: 5rem;
    padding: 2rem;
}

.flight-selection_type {
    display: flex;
    gap: 2.5rem;
}

.info-divider {
    height: 2rem;
    width: 0.15rem;
    background-color: #ccc;
}

.flight-selection_banner {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
}

.banner-image {
    width: 100%;
    max-height: 25rem;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.banner-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: #ffffff;
    padding: 1.5rem 2rem;
    border-radius: 1.5rem;
}

.banner-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.banner-route {
    font-size: 1.8rem;
}

.selected-outbound {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: #f5f7fa;
    padding: 2rem;
    margin: 6rem 17%;
    border-radius: 1.5rem;
}

.outbound-info {
    display: flex;
    justify-content: space-between;
    font-size: 1.8rem;
}

.divider {
    width: 100%;
    height: .1rem;
    background-color: #374151;
}

.flight-schedule {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    margin-left: 2rem;
    margin-right: 2rem;
}
.departure-details {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
.flight-duration {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .5rem;
    color: #003366;
}

.duration-extra {
    width: 600%;
    height: 30%;
    border-bottom: .2rem dotted #374151;
}
.arrival-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .5rem;
}

.flight-selection_list {
    background-color: #f8f8f8;
    min-height: 100%;
    padding: 6rem 0;
    margin-bottom: 8.5rem;
}

.flight-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
}

.flight-item {
    display: flex;
    gap: 5rem;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    width: 100rem;
    border-radius: 1.5rem;
    padding-left: 2.5rem;
}

.flight-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rem;
}

.flight-route {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    align-items: center;
}

.flight-details {
    border-left: .1rem solid #cccccc;
    padding-left: 4rem;
    display: flex;
    flex-direction: column;
    gap: .75rem;
}

.seat-options {
    display: flex;
    gap: .5rem;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
}

.seat-option {
    display: flex;
    gap: 1.5rem;
    flex-direction: column; 
    align-items: center;
    cursor: pointer;
    padding: 6rem 0;
    width: 18rem;  
}

.seat-option[data-category="Economy"] {
    background-color: #003366; 
    color: #ffffff; 
}

.seat-option[data-category="Deluxe"] {
    background-color: #bbbbbb; 
    color: #000000; 
}

.seat-option[data-category="SkyBoss"] {
    background-color: #ffc107; 
    color: #000000; 
    border-top-right-radius: 1.5rem;
    border-bottom-right-radius: 1.5rem;
}

.seat-option input[type="radio"] {
    margin-bottom: 0.5rem;
    accent-color: #ff4d4f;
}

.seat-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .75rem;
}

.button-group {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between; 
    align-items: center;
    padding: 2rem 16rem;
    background-color: #ffffff;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); 
    z-index: 1000; 
}

.back-btn, .continue-btn {
    padding: 1.25rem 2rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.back-btn {
    background-color: #ccc;
    color: #333;
}

.back-btn:hover {
    background-color: #bbb;
}

.continue-btn {
    background-color: #ff4d4f;
    color: #fff;
}

.continue-btn:hover {
    background-color: #e60000;
}

.continue-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .flight-selection_info {
        gap: 3rem;
        padding: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .flight-selection_type {
        gap: 2rem;
    }

    .info-divider {
        height: 1.8rem;
    }

    .banner-image {
        max-height: 20rem;
    }

    .banner-overlay {
        padding: 1.2rem 1.5rem;
        border-radius: 1.2rem;
    }

    .banner-title {
        font-size: 1.8rem;
    }

    .banner-route {
        font-size: 1.6rem;
    }
    
    .selected-outbound {
        margin: 2rem 4rem;
    }

    .flight-selection_list {
        padding: 4rem 0;
        margin-bottom: 7rem;
    }

    .flight-results {
        gap: 2rem;
    }

    .flight-item {
        width: 90%;
        gap: 3rem;
        padding-left: 2rem;
        border-radius: 1.2rem;
    }

    .flight-info {
        gap: 3rem;
    }

    .flight-route {
        gap: 0.6rem;
    }

    .flight-details {
        padding-left: 3rem;
    }

    .seat-options {
        font-size: 1.6rem;
        gap: 0.4rem;
    }

    .seat-option {
        width: 16rem;
        padding: 4rem 0;
    }

    .seat-option[data-category="SkyBoss"] {
        border-top-right-radius: 1.2rem;
        border-bottom-right-radius: 1.2rem;
    }

    .seat-info {
        gap: 0.6rem;
    }

    .button-group {
        padding: 1.5rem 2rem;
    }

    .back-btn, .continue-btn {
        padding: 1rem 1.5rem;
    }

    .selected-outbound {
        margin: 2rem 4rem; 
        padding: 1.5rem;
        border-radius: 1.2rem;
    }

    .outbound-info {
        font-size: 1.6rem;
        gap: 0.4rem;
    }

    .flight-schedule {
        gap: 0.8rem;
        margin: 1rem;
    }

    .departure-details,
    .arrival-details {
        flex: 1;
    }

    .flight-duration {
        flex: 2;
    }

    .duration-extra {
        width: 100%; 
        max-width: 40rem; 
    }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
    .selected-outbound {
        margin: 2rem 2rem; 
        padding: 1rem;
        border-radius: 1rem;
    }

    .outbound-info {
        font-size: 1.4rem;
        text-align: center;
    }

    .divider {
        margin: 0.5rem 0;
    }

    .flight-schedule {
        flex-direction: column; 
        gap: 1.5rem;
        margin: 0;
    }

    .departure-details,
    .flight-duration,
    .arrival-details {
        text-align: center;
        width: 100%;
    }

    .departure-details p,
    .arrival-details p {
        font-size: 1.6rem;
    }

    .duration-extra {
        width: 100%;
        max-width: 20rem; 
        height: 0.2rem;
    }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
    .flight-selection_info {
        gap: 2rem;
        padding: 1rem;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .flight-selection_type {
        gap: 1.5rem;
    }

    .info-divider {
        display: none;
    }

    .banner-image {
        max-height: 18rem;
    }

    .banner-overlay {
        padding: 1rem 1.2rem;
        border-radius: 1rem;
    }

    .banner-title {
        font-size: 1.6rem;
    }

    .banner-route {
        font-size: 1.4rem;
    }
    
    .selected-outbound {
        margin: 2rem 2rem;
    }

    .flight-selection_list {
        padding: 3rem 0;
        margin-bottom: 6rem;
    }

    .flight-results {
        gap: 1.5rem;
    }

    .flight-item {
        flex-direction: column;
        width: 90%;
        gap: 2rem;
        padding: 1.5rem;
        border-radius: 1rem;
    }

    .flight-info {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }

    .flight-route {
        gap: 0.5rem;
    }

    .flight-details {
        border-left: none;
        border-top: 0.1rem solid #cccccc;
        padding-left: 0;
        padding-top: 1.5rem;
        gap: 0.5rem;
    }

    .seat-options {
        font-size: 1.4rem;
        gap: 0.3rem;
        flex-wrap: wrap;
    }

    .seat-option {
        width: 14rem;
        padding: 3rem 0;
    }

    .seat-option[data-category="SkyBoss"] {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .seat-info {
        gap: 0.5rem;
    }

    .button-group {
        padding: 1rem 1rem;
    }

    .back-btn, .continue-btn {
        padding: 0.8rem 1.2rem;
    }
}

/* Mobile (portrait): 320px - 480px */
@media (max-width: 480px) {
    .flight-selection_info {
        gap: 1.5rem;
        padding: 0.8rem;
    }

    .flight-selection_type {
        gap: 1rem;
    }

    .info-divider {
        display: none;
    }

    .banner-image {
        max-height: 15rem;
    }

    .banner-overlay {
        padding: 0.8rem 1rem;
        border-radius: 0.8rem;
    }

    .banner-title {
        font-size: 1.4rem;
    }

    .banner-route {
        font-size: 1.2rem;
    }
    
    .selected-outbound {
        margin: 1.5rem 1rem;
        padding: 1.5rem;
    }

    .flight-selection_list {
        padding: 2rem 0;
        margin-bottom: 5rem;
    }

    .flight-results {
        gap: 1rem;
    }

    .flight-item {
        width: 95%;
        gap: 1.5rem;
        padding: 1rem;
        border-radius: 0.8rem;
    }

    .flight-info {
        gap: 1rem;
    }

    .flight-route {
        gap: 0.4rem;
    }

    .flight-details {
        padding-top: 1rem;
        gap: 0.4rem;
    }

    .seat-options {
        font-size: 1.2rem;
        gap: 0.2rem;
    }

    .seat-option {
        width: 100%;
        padding: 2rem 0;
        border-radius: 0.8rem !important;
    }

    .seat-info {
        gap: 0.4rem;
    }

    .button-group {
        padding: 0.8rem 0.5rem;
    }

    .back-btn, .continue-btn {
        padding: 0.6rem 1rem;
    }

    .selected-outbound {
        margin: 1.5rem 1rem; 
        padding: 0.8rem;
        border-radius: 0.8rem;
    }

    .outbound-info {
        font-size: 1.2rem;
        gap: 0.3rem;
    }

    .divider {
        margin: 0.3rem 0;
    }

    .flight-schedule {
        gap: 1rem;
    }

    .departure-details p,
    .arrival-details p {
        font-size: 1.4rem;
    }

    .flight-duration p {
        font-size: 1rem;
    }

    .duration-extra {
        width: 100%;
        max-width: 15rem; 
        height: 0.1rem; 
        border-bottom: 0.1rem dotted #374151;
    }
}
</style>