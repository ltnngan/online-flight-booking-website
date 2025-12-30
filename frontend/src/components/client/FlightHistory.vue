<!-- src/components/FlightHistory.vue -->
<template>
  <div class="history-section">
    <h2>Lịch sử chuyến bay</h2>
    <div v-if="isLoadingHistory" class="loading">Đang tải...</div>
    <div v-else-if="flightHistory.length === 0" class="no-flights">
      Bạn chưa có lịch sử chuyến bay nào.
    </div>
    <div v-else class="flights-list">
      <div v-for="booking in flightHistory" :key="booking.bookingCode" class="flight-card history">
        <div class="flight-header">
          <h3>Mã đặt chỗ: {{ booking.bookingCode }}</h3>
          <span :class="['status', getStatusClass(booking.status)]">{{ booking.status }}</span>
        </div>
        <div class="flight-details" v-for="(flight, index) in booking.flight" :key="index">
          <div class="flight-route">
            <span class="from">{{ flight.flightId.fromCity }}</span>
            <i class="fas fa-plane"></i>
            <span class="to">{{ flight.flightId.toCity }}</span>
          </div>
          <div class="flight-info">
            <div class="flight-code">{{ flight.flightId.flightCode }}</div>
            <div class="flight-date">{{ formatDate(flight.flightId.date) }}</div>
            <div class="flight-time">{{ flight.flightId.time }}</div>
          </div>
        </div>
        <div class="booking-footer">
          <div class="price">Tổng tiền: {{ formatCurrency(booking.totalPrice) }}</div>
          <div class="booking-date">Ngày đặt: {{ formatDate(booking.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import accountService from '../../services/client/account.service';

export default {
  name: 'FlightHistory',
  data() {
    return {
      flightHistory: [],
      isLoadingHistory: false,
    };
  },
  created() {
    this.loadFlightHistory();
  },
  methods: {
    async loadFlightHistory() {
      this.isLoadingHistory = true;
      try {
        const response = await accountService.getFlightHistory();
        if (response.success) {
          this.flightHistory = response.data;
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch sử chuyến bay:', error);
      } finally {
        this.isLoadingHistory = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    },
    getStatusClass(status) {
      switch (status) {
        case 'Confirmed':
          return 'confirmed';
        case 'Pending':
          return 'pending';
        case 'Cancelled':
          return 'cancelled';
        case 'Completed':
          return 'completed';
        default:
          return '';
      }
    },
  },
};
</script>

<style scoped>
/* Copy các style liên quan từ file gốc */
.history-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.flights-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .flights-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.flight-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.flight-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.flight-card.history {
  background-color: #f9f9f9;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.flight-header h3 {
  font-size: 18px;
  margin: 0;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.confirmed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status.cancelled {
  background-color: #ffebee;
  color: #c62828;
}

.status.completed {
  background-color: #e0f7fa;
  color: #0277bd;
}

.flight-details {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eaeaea;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 500;
}

.flight-route i {
  color: #757575;
}

.flight-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.price {
  font-weight: 600;
  color: #333;
}

.booking-date {
  font-size: 14px;
  color: #757575;
}

.no-flights,
.loading {
  text-align: center;
  padding: 30px;
  color: #757575;
  font-style: italic;
}
</style>