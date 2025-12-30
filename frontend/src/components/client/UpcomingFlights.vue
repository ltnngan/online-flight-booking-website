<!-- src/components/client/UpcomingFlights.vue -->
<template>
  <div class="flights-section">
    <div v-if="isLoading" class="status-message loading">
      <i class="fas fa-spinner fa-spin"></i> Đang tải...
    </div>
    <div v-else-if="upcomingFlights.length === 0" class="status-message no-flights">
      <i class="fas fa-plane-slash"></i> Bạn không có chuyến bay nào sắp tới.
    </div>
    <div v-else class="flights-list">
      <div v-for="booking in upcomingFlights" :key="booking.bookingCode" class="flight-card">
        <div class="card-top-bar" :class="getStatusClass(booking.status)"></div>
        <div class="flight-header">
          <div class="booking-info">
            <span class="booking-label">Mã đặt chỗ</span>
            <h3 class="booking-code">{{ booking.bookingCode }}</h3>
          </div>
          <span :class="['status-badge', getStatusClass(booking.status)]">{{ booking.status }}</span>
        </div>
        
        <div class="flight-segment" v-for="(flight, index) in booking.flight" :key="index">
          <div class="flight-number">
            <i class="fas fa-plane"></i>
            <span>{{ flight.flightId.flightCode }}</span>
          </div>
          <div class="flight-route">
            <div class="city from">
              <span class="city-name">{{ flight.flightId.fromCity }}</span>
            </div>
            <div class="flight-line">
              <div class="flight-details">
                <span class="flight-date">{{ formatDate(flight.flightId.date) }}</span>
                <span class="flight-time">{{ flight.flightId.time }}</span>
              </div>
            </div>
            <div class="city to">
              <span class="city-name">{{ flight.flightId.toCity }}</span>
            </div>
          </div>
        </div>
        
        <div class="booking-footer">
          <div class="price">
            <span class="price-label">Tổng tiền</span>
            <span class="price-value">{{ formatCurrency(booking.totalPrice) }}</span>
          </div>
          <div class="button-group">
            <button
              v-if="booking.status === 'Pending'"
              class="btn btn-primary"
              @click="continuePayment(booking.bookingCode)"
              :disabled="processingPayment === booking.bookingCode"
            >
              <span v-if="processingPayment === booking.bookingCode">
                <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
              </span>
              <span v-else>
                <i class="fas fa-credit-card"></i> Thanh toán
              </span>
            </button>
            <button
              v-if="canCancel(booking.status)"
              class="btn btn-outline"
              @click="confirmCancelBooking(booking.bookingCode)"
              :disabled="cancelingBooking === booking.bookingCode"
            >
              <span v-if="cancelingBooking === booking.bookingCode">
                <i class="fas fa-spinner fa-spin"></i> Đang hủy...
              </span>
              <span v-else>
                <i class="fas fa-times"></i> Hủy
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas fa-exclamation-triangle"></i> Xác nhận hủy đặt vé
          </h2>
          <button class="modal-close" @click="showCancelModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn hủy đặt vé <strong>{{ bookingToCancel }}</strong> không?</p>
          <p class="modal-note">Lưu ý: Hành động này không thể hoàn tác.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showCancelModal = false">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <button class="btn btn-danger" @click="cancelBooking" :disabled="isCanceling">
            <span v-if="isCanceling">
              <i class="fas fa-spinner fa-spin"></i> Đang hủy...
            </span>
            <span v-else>
              <i class="fas fa-check"></i> Xác nhận hủy
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookingAPI } from '../../services/client/booking.service';
import accountService from '../../services/client/account.service';

export default {
  name: 'UpcomingFlights',
  data() {
    return {
      upcomingFlights: [],
      isLoading: false,
      showCancelModal: false,
      bookingToCancel: null,
      isCanceling: false,
      cancelingBooking: null,
      processingPayment: null,
    };
  },
  created() {
    this.loadUpcomingFlights();
  },
  methods: {
    async loadUpcomingFlights() {
      this.isLoading = true;
      try {
        const response = await accountService.getMyFlights();
        if (response.success) {
          this.upcomingFlights = response.data;
        }
      } catch (error) {
        console.error('Lỗi khi tải chuyến bay sắp tới:', error);
        this.$emit('error', 'Không thể tải chuyến bay sắp tới. Vui lòng thử lại sau.');
      } finally {
        this.isLoading = false;
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
    canCancel(status) {
      return ['Pending', 'Confirmed'].includes(status);
    },
    confirmCancelBooking(bookingCode) {
      this.bookingToCancel = bookingCode;
      this.showCancelModal = true;
    },
    async cancelBooking() {
      this.isCanceling = true;
      this.cancelingBooking = this.bookingToCancel;
      try {
        const response = await bookingAPI.cancelBooking(this.bookingToCancel);
        if (response.message === 'Hủy đặt vé thành công') {
          this.upcomingFlights = this.upcomingFlights.map((booking) => {
            if (booking.bookingCode === this.bookingToCancel) {
              return { ...booking, status: 'Cancelled' };
            }
            return booking;
          });
          this.$emit('success', `Đã hủy đặt vé ${this.bookingToCancel} thành công!`);
        }
      } catch (error) {
        console.error('Lỗi khi hủy đặt vé:', error);
        this.$emit('error', 'Không thể hủy đặt vé. Vui lòng thử lại sau.');
      } finally {
        this.isCanceling = false;
        this.showCancelModal = false;
        this.cancelingBooking = null;
        this.bookingToCancel = null;
      }
    },
    async continuePayment(bookingCode) {
      this.processingPayment = bookingCode;
      try {
        const response = await bookingAPI.getBookingPaymentUrl(bookingCode);
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          this.$emit('error', response.message || 'Không thể lấy link thanh toán. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy link thanh toán:', error);
        const errorMessage = error.response?.data?.message || 'Không thể lấy link thanh toán. Vui lòng thử lại sau.';
        this.$emit('error', errorMessage);
      } finally {
        this.processingPayment = null;
      }
    },
  },
};
</script>

<style scoped>
.flights-section {
  font-family: 'Inter', sans-serif;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.status-message {
  text-align: center;
  padding: 60px 30px;
  font-size: 18px;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}

.status-message i {
  margin-right: 10px;
  font-size: 24px;
}

.status-message.loading {
  color: #0284c7;
}

.status-message.no-flights {
  font-style: italic;
}

.flights-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.flight-card {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #eaeaea;
}

.flight-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.card-top-bar {
  height: 4px;
  width: 100%;
}

.card-top-bar.confirmed {
  background-color: #10b981;
}

.card-top-bar.pending {
  background-color: #f59e0b;
}

.card-top-bar.cancelled {
  background-color: #ef4444;
}

.card-top-bar.completed {
  background-color: #3b82f6;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.booking-info {
  display: flex;
  flex-direction: column;
}

.booking-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.booking-code {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.confirmed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.completed {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.flight-segment {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.flight-number {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.flight-number i {
  margin-right: 8px;
  color: #0284c7;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.city {
  text-align: center;
  flex: 1;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.flight-line {
  flex: 2;
  position: relative;
  padding: 0 20px;
}

.flight-line:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1 50%, transparent);
}

.flight-details {
  position: relative;
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 6px 12px;
  display: inline-block;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}

.flight-date, .flight-time {
  font-size: 13px;
  color: #64748b;
  margin: 0 4px;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.price-value {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn i {
  margin-right: 8px;
}

.btn-primary {
  background-color: #0284c7;
  color: white;
}

.btn-primary:hover {
  background-color: #0369a1;
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.btn-outline:hover {
  background-color: #f1f5f9;
}

.btn-outline:disabled {
  color: #94a3b8;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

.modal-header {
  background-color: #fef2f2;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #fee2e2;
}

.modal-header h2 {
  font-size: 18px;
  color: #ef4444;
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-header h2 i {
  margin-right: 12px;
}

.modal-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  font-size: 16px;
  color: #0f172a;
  margin-bottom: 16px;
}

.modal-note {
  font-size: 14px;
  color: #64748b;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .flights-list {
    grid-template-columns: 1fr;
  }
  
  .flight-route {
    flex-direction: column;
    gap: 20px;
  }
  
  .city {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .flight-line {
    width: 100%;
    padding: 10px 0;
  }
  
  .flight-line:before {
    display: none;
  }
  
  .flight-details {
    position: static;
    transform: none;
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .booking-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .button-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .status-message {
    padding: 40px 20px;
    font-size: 16px;
  }
  
  .flight-header {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .status-badge {
    align-self: flex-start;
  }
  
  .flight-segment {
    padding: 16px;
  }
  
  .flight-details {
    flex-direction: column;
    padding: 8px 12px;
  }
  
  .btn {
    padding: 10px;
    font-size: 13px;
  }
  
  .btn i {
    margin-right: 4px;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-header, .modal-body, .modal-actions {
    padding: 16px;
  }
}
</style>