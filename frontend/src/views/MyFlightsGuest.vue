<!-- MyFlightsGuest.vue -->
<template>
  <div class="my-flights-guest">
    <AppHeader />
    <div>
      <h2>Tra cứu chuyến bay của bạn</h2>
    
    <!-- Form tìm kiếm -->
    <div class="search-form">
      <input
        v-model="bookingCode"
        placeholder="Nhập mã đặt chỗ"
        class="form-input"
      />
      <input
        v-model="contactName"
        placeholder="Nhập tên người liên hệ"
        class="form-input"
      />
      <button @click="searchFlights" class="search-button">
        Tra cứu
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      Đang tải...
    </div>

    <!-- Error message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Kết quả -->
    <div v-if="bookings.length > 0" class="bookings-list">
      <div v-for="booking in bookings" :key="booking._id" class="booking-card">
        <h3>Mã đặt chỗ: {{ booking.bookingCode }}</h3>
        <div class="flight-details">
          <div v-for="flight in booking.flight" :key="flight._id">
            <p>Mã chuyến bay: {{ flight.flightId.flightCode }}</p>
            <p>Từ: {{ flight.flightId.fromCity }} → Đến: {{ flight.flightId.toCity }}</p>
            <p>Ngày: {{ formatDate(flight.flightId.date) }} {{ flight.flightId.time }}</p>
            <p>Thời gian bay: {{ flight.flightId.duration }}</p>
          </div>
        </div>
        <p>Tổng giá: {{ formatPrice(booking.totalPrice) }} VND</p>
        <p>Trạng thái: {{ booking.status }}</p>
        <p>Người liên hệ: {{ booking.contactInfo.name }}</p>
      </div>
    </div>

    <!-- Không tìm thấy -->
    <div v-else-if="searched && !loading && !error" class="no-results">
      Không tìm thấy đặt chỗ nào phù hợp
    </div>
  </div>
    </div>
</template>

<script>
import flightAPI from '../services/client/flight.service';
import AppHeader from "../components/client/AppHeader.vue";

export default {
  name: 'MyFlightsGuest',
  components: {
        AppHeader
    },

  data() {
    return {
      bookingCode: '',
      contactName: '',
      bookings: [],
      loading: false,
      error: null,
      searched: false
    };
  },
  methods: {
    async searchFlights() {
      if (!this.bookingCode || !this.contactName) {
        this.error = 'Vui lòng nhập cả mã đặt chỗ và tên người liên hệ';
        return;
      }

      this.loading = true;
      this.error = null;
      this.searched = true;

      try {
        const response = await flightAPI.getMyFlightsGuest(
          this.bookingCode,
          this.contactName
        );
        
        if (response.data.success) {
          this.bookings = response.data.data;
        } else {
          this.error = response.data.message;
          this.bookings = [];
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Đã xảy ra lỗi khi tra cứu';
        this.bookings = [];
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN');
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(price);
    }
  }
};
</script>

<style scoped>
h2 {
  color: #333;
  border-bottom: 3px solid #ffc107;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-input {
  flex: 1;
  min-width: 250px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #ffc107;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
}

.search-button {
  background-color: #ffc107;
  color: #333;
  font-weight: bold;
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.search-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.search-button:active {
  transform: translateY(0);
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.error {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.booking-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border-top: 5rem solid #ffc107;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.booking-card h3 {
  margin-top: 0;
  color: #333;
  display: flex;
  align-items: center;
}

.booking-card h3:before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #ffc107;
  margin-right: 10px;
  border-radius: 50%;
}

.flight-details {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  border-left: 3px solid #ffc107;
}

.flight-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}


.my-flights-guest > div:nth-child(2) {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

h2 {
  color: #333;
  border-bottom: 3px solid #ffc107;
  padding-bottom: 10px;
  margin: 30px 0 25px;
  font-size: 24px;
  font-weight: 600;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-input {
  flex: 1;
  min-width: 250px;
  padding: 14px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
}

.search-button {
  background-color: #ffc107;
  color: #333;
  font-weight: bold;
  padding: 14px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.search-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.booking-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border-top: 5rem solid #ffc107;
  width: 100%; /* Đảm bảo chiều rộng tối đa */
  max-width: 100%; /* Đảm bảo không vượt quá container */
  box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước */
}

.bookings-list {
  display: block; /* Thay đổi từ grid sang block */
  width: 100%;
}

.booking-card + .booking-card {
  margin-top: 20px; /* Khoảng cách giữa các card nếu có nhiều card */
}
</style>