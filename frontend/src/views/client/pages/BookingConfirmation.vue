<template>
  <div class="booking-confirmation">
    <AppHeader />
    <div class="flight-selection-content">
      <div class="selected-outbound">
        <div class="outbound-info">
          <p><strong>{{ bookingDetails.flights.outbound.fromCity }} đến {{ bookingDetails.flights.outbound.toCity }}</strong> - {{ formatDate(bookingDetails.flights.outbound.date) }}</p>
          <p>{{ bookingDetails.flights.outbound.flightCode }} - {{ bookingDetails.flights.outbound.seatType }} - {{ formatPrice(bookingDetails.flights.outbound.price) }} VND</p>
        </div>
        <div class="divider"></div>
        <div class="flight-schedule">
          <div class="departure-details">
            <p class="time">{{ bookingDetails.flights.outbound.time }}</p>
            <p class="city">{{ bookingDetails.flights.outbound.fromCity }}</p>
          </div>
          <div class="flight-duration">
            <p>✈ Bay thẳng - {{ bookingDetails.flights.outbound.duration }}</p>
            <div class="duration-extra"></div>
          </div>
          <div class="arrival-details">
            <p class="time">{{ calculateArrivalTime(bookingDetails.flights.outbound.time, bookingDetails.flights.outbound.duration) }}</p>
            <p class="city">{{ bookingDetails.flights.outbound.toCity }}</p>
          </div>
        </div>
      </div>

      <div v-if="bookingDetails.flights.return" class="selected-return">
        <div class="return-info">
          <p><strong>{{ bookingDetails.flights.return.fromCity }} đến {{ bookingDetails.flights.return.toCity }}</strong> - {{ formatDate(bookingDetails.flights.return.date) }}</p>
          <p>{{ bookingDetails.flights.return.flightCode }} - {{ bookingDetails.flights.return.seatType }} - {{ formatPrice(bookingDetails.flights.return.price) }} VND</p>
        </div>
        <div class="divider"></div>
        <div class="flight-schedule">
          <div class="departure-details">
            <p class="time">{{ bookingDetails.flights.return.time }}</p>
            <p class="city">{{ bookingDetails.flights.return.fromCity }}</p>
          </div>
          <div class="flight-duration">
            <p>✈ Bay thẳng - {{ bookingDetails.flights.return.duration }}</p>
            <div class="duration-extra"></div>
          </div>
          <div class="arrival-details">
            <p class="time">{{ calculateArrivalTime(bookingDetails.flights.return.time, bookingDetails.flights.return.duration) }}</p>
            <p class="city">{{ bookingDetails.flights.return.toCity }}</p>
          </div>
        </div>
      </div>

      <div class="passenger-details">
        <h3>Thông tin hành khách</h3>
        <div v-for="(passenger, index) in bookingDetails.passengers" :key="index" class="passenger-card">
          <h4>{{ getPassengerLabel(passenger, index) }}</h4>
          <p><strong>Họ tên:</strong> {{ passenger.name }}</p>
          <p><strong>Ngày sinh:</strong> {{ formatDate(passenger.dob) }}</p>
          <p><strong>Giới tính:</strong> {{ formatGender(passenger.gender) }}</p>
        </div>
      </div>

      <div class="contact-details">
        <h3>Thông tin liên hệ</h3>
        <div class="contact-card">
          <p><strong>Họ tên:</strong> {{ bookingDetails.contactInfo.name }}</p>
          <p><strong>Email:</strong> {{ bookingDetails.contactInfo.email }}</p>
          <p><strong>Số điện thoại:</strong> {{ bookingDetails.contactInfo.phoneNumber }}</p>
        </div>
      </div>

      <div class="total-price">
        <h3>Tổng cộng</h3>
        <p style="font-size: 1.8rem;">Hành khách: {{ bookingDetails.passengers.length }} người</p>
        <p class="total-amount">Giá tiền: {{ bookingDetails.totalPrice }} VND</p>
      </div>

      <div class="payment-methods">
        <h3>Phương thức thanh toán</h3>
        <div class="payment-option">
          <input 
            type="radio" 
            id="momo" 
            value="momo" 
            v-model="selectedPaymentMethod" 
            checked
          >
          <label for="momo">
            <img src="/momo.png" alt="MoMo" class="payment-logo">
            Thanh toán qua MoMo
          </label>
        </div>
      </div>

      <div class="button-group">
        <button @click="goBackToBookingInfo" class="back-btn">Quay lại</button>
        <button @click="proceedToPayment" class="continue-btn" :disabled="isProcessing">
          {{ isProcessing ? 'Đang xử lý...' : `Thanh toán qua ${selectedPaymentMethod}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { bookingAPI } from '../../../services/client/booking.service';
import AppHeader from "../../../components/client/AppHeader.vue";

export default {
  components: {
        AppHeader
  },
  
  data() {
    return {
        bookingDetails: {},
        bookingCode: '',
        selectedPaymentMethod: 'momo',
        isProcessing: false,
        errorMessage: '',
        adultCount: 0,
        childCount: 0
    };
  },
  
  created() {
    const storedData = sessionStorage.getItem('bookingData');
    if (storedData) {
        this.bookingDetails = JSON.parse(storedData);
        
        this.countPassengerTypes();
    } else {
      
        this.$router.push({ name: 'BookingInformation' });
    }

    const confirmationData = sessionStorage.getItem('bookingConfirmationData');
        if (confirmationData) {
        const parsedConfirmationData = JSON.parse(confirmationData);
        this.bookingCode = parsedConfirmationData.bookingCode;
        this.selectedPaymentMethod = parsedConfirmationData.selectedPaymentMethod || 'momo';
    } else {
        this.saveToSessionStorage(); 
    }
  },
  
  methods: {
    countPassengerTypes() {
        if (this.bookingDetails.passengers && this.bookingDetails.passengers.length > 0) {
            this.adultCount = this.bookingDetails.passengers.filter(p => p.type === 'adult').length;
            this.childCount = this.bookingDetails.passengers.filter(p => p.type === 'child').length;
        }
    },
    getPassengerLabel(passenger, index) {
        if (passenger.type === 'adult') {
            const adultIndex = this.bookingDetails.passengers.slice(0, index + 1).filter(p => p.type === 'adult').length;
            return `Người lớn ${adultIndex}`;
        } else {
            const childIndex = this.bookingDetails.passengers.slice(0, index + 1).filter(p => p.type === 'child').length;
            return `Trẻ em ${childIndex}`;
        }
    },
    saveToSessionStorage() {
        const confirmationData = {
            bookingCode: this.bookingCode,
            bookingDetails: this.bookingDetails,
            selectedPaymentMethod: this.selectedPaymentMethod
        };
        sessionStorage.setItem('bookingConfirmationData', JSON.stringify(confirmationData));
    },
    goBackToBookingInfo() {
        this.saveToSessionStorage();
        this.$router.push({ name: 'BookingInformation' });
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
    formatGender(gender) {
        if (gender === 'male') return 'Nam';
        if (gender === 'female') return 'Nữ';
        return gender;
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
    async proceedToPayment() {
      this.isProcessing = true;
      this.errorMessage = '';
      
      if (this.selectedPaymentMethod === 'momo') {
        const bookingData = {
            paymentMethod: this.selectedPaymentMethod,
            outboundFlight: {
                flightId: this.bookingDetails.flights.outbound._id,
                seatTypeOutbound: this.bookingDetails.flights.outbound.seatType,
                priceOutboundFlight: this.bookingDetails.flights.outbound.price
            },
            returnFlight: this.bookingDetails.flights.return ? {
                flightId: this.bookingDetails.flights.return._id,
                seatTypeReturn: this.bookingDetails.flights.return.seatType,
                priceReturnFlight: this.bookingDetails.flights.return.price
            } : null,
            passengers: this.bookingDetails.passengers,
            contactInfo: this.bookingDetails.contactInfo,
            totalPrice: this.bookingDetails.totalPrice.replace(/[^\d]/g, '') 
        };

        try {
            const response = await bookingAPI.createBooking(bookingData);
            console.log('API Response:', response);

            if (response.paymentUrl) {
                this.clearBookingSessionData();

                window.location.href = response.paymentUrl;
            } else {
                throw new Error('Không nhận được URL thanh toán từ server');
            }
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Lỗi khi tạo thanh toán MoMo';
                alert(this.errorMessage);
        } finally {
            this.isProcessing = false;
        }
      }
    },
    
    clearBookingSessionData() {
        sessionStorage.removeItem('searchParams');
        sessionStorage.removeItem('flightResults');
        sessionStorage.removeItem('outboundFlight');
        sessionStorage.removeItem('bookingInfo');
        sessionStorage.removeItem('bookingData');
        sessionStorage.removeItem('bookingConfirmationData');
        sessionStorage.removeItem('returnFlightSelectionState');
    }
  }
};
</script>

<style scoped>
.booking-confirmation {
  width: 100%;
  background-color: #f5f7fa;
  padding-bottom: 8rem;
}

.selected-outbound,
.selected-return,
.passenger-details,
.contact-details,
.payment-methods {
  background-color: #ffffff;
  padding: 2rem;
  margin: 2rem 17%;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.outbound-info,
.return-info {
  display: flex;
  justify-content: space-between;
  font-size: 1.6rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.divider {
  width: 100%;
  height: 0.1rem;
  background-color: #e0e0e0;
}

.flight-schedule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 2rem;
  gap: 1rem;
}

.departure-details,
.arrival-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}

.flight-duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #003366;
  flex: 1;
}

.time {
  font-size: 1.8rem;
  font-weight: 500;
}

.city {
  color: #003366;
  font-size: 1.4rem;
}

.duration-extra {
  width: 100%;
  border-bottom: 0.2rem dotted #374151;
}

.passenger-card, 
.contact-card {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
}

.passenger-details h3, 
.contact-details h3,
.payment-methods h3 {
  font-size: 2rem;
  color: #003366;
  margin-bottom: 1rem;
}

.passenger-card h4 {
  margin-top: 0;
  color: #ffc107;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  margin-bottom: 1rem;
}

.passenger-card p, .contact-card p {
    line-height: 2;
}

.total-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    padding: 2rem;
    margin: 2rem 17%;
    font-size: 2.5rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  background: #f8f8f8;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e0e0e0;
}

.payment-logo {
  width: 40px;
  height: 40px;
  vertical-align: middle;
}

.payment-option input[type="radio"] {
    margin-bottom: 0.5rem;
    accent-color: #ff4d4f;
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
</style>