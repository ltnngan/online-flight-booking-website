<template>
  <div class="booking-list">
    <!-- Phần tìm kiếm và lọc -->
    <div class="search-filter-container">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm theo mã đặt vé, tên liên hệ hoặc email..." 
          @input="handleSearch"
        />
        <button class="search-btn">
          <i class="fas fa-search"></i> Tìm kiếm
        </button>
      </div>
      
      <div class="filter-container">
        <div class="filter-group">
          <label>Trạng thái đặt vé:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">Tất cả</option>
            <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Trạng thái thanh toán:</label>
          <select v-model="filters.paymentStatus" @change="applyFilters">
            <option value="">Tất cả</option>
            <option v-for="status in uniquePaymentStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Giá từ:</label>
          <input 
            type="number" 
            v-model="filters.minPrice" 
            placeholder="Giá thấp nhất" 
            @input="applyFilters"
          />
        </div>
        
        <div class="filter-group">
          <label>Giá đến:</label>
          <input 
            type="number" 
            v-model="filters.maxPrice" 
            placeholder="Giá cao nhất" 
            @input="applyFilters"
          />
        </div>
        
        <button class="reset-btn" @click="resetFilters">
          Đặt lại
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Đang tải...</div>
    <div v-else-if="filteredBookings.length" class="booking-table">
      <table>
        <thead>
          <tr>
            <th>Mã Đặt Vé</th>
            <th>Thông Tin Liên Hệ</th>
            <th>Chuyến Bay</th>
            <th>Hành Khách</th>
            <th>Tổng Giá</th>
            <th>Trạng Thái Thanh Toán</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in filteredBookings" :key="booking._id">
            <td>{{ booking.bookingCode }}</td>
            <td>
              <strong>Tên:</strong> {{ booking.contactInfo.name }}<br />
              <strong>Email:</strong> {{ booking.contactInfo.email || 'Không có' }}<br />
              <strong>Số Điện Thoại:</strong> {{ booking.contactInfo.phoneNumber || 'Không có' }}
            </td>
            <td>
              <ul>
                <li v-for="(flight, index) in booking.flight" :key="index">
                  <strong>Chuyến Bay:</strong> {{ flight.flightId ? flight.flightId.flightCode : 'Không có' }}<br />
                  <strong>Loại Vé:</strong> {{ flight.ticketType }}<br />
                  <strong>Giá:</strong> {{ formatCurrency(flight.price) }}
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="(passenger, index) in booking.passengers" :key="index">
                  <strong>Tên:</strong> {{ passenger.name }}<br />
                  <strong>Ngày Sinh:</strong> {{ formatDate(passenger.dob) }}<br />
                  <strong>Giới Tính:</strong> {{ passenger.gender }}
                </li>
              </ul>
            </td>
            <td>{{ formatCurrency(booking.totalPrice) }}</td>
            <td>{{ booking.payment?.status || 'Không có' }}</td>
            <td>{{ booking.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>Không tìm thấy đặt vé nào phù hợp với điều kiện tìm kiếm.</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { getAllBookings } from '../../../services/admin/booking.service';

export default {
  name: 'BookingList',
  data() {
    return {
      bookings: [],
      filteredBookings: [],
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      searchQuery: '',
      filters: {
        status: '',
        paymentStatus: '',
        minPrice: '',
        maxPrice: ''
      },
      searchTimeout: null
    };
  },
  created() {
    this.fetchBookings();
  },
  computed: {
    uniqueStatuses() {
      // Tạo danh sách các trạng thái đặt vé duy nhất
      const statuses = new Set();
      this.bookings.forEach(booking => {
        if (booking.status) {
          statuses.add(booking.status);
        }
      });
      return Array.from(statuses).sort();
    },
    uniquePaymentStatuses() {
      // Tạo danh sách các trạng thái thanh toán duy nhất
      const statuses = new Set();
      this.bookings.forEach(booking => {
        if (booking.payment && booking.payment.status) {
          statuses.add(booking.payment.status);
        }
      });
      return Array.from(statuses).sort();
    }
  },
  methods: {
    async fetchBookings() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await getAllBookings();
        this.bookings = response.data.data || [];
        this.filteredBookings = [...this.bookings]; // Khởi tạo danh sách đã lọc
      } catch (error) {
        this.errorMessage = 'Không thể tải danh sách đặt vé. Vui lòng thử lại.';
      } finally {
        this.isLoading = false;
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    handleSearch() {
      // Debounce tìm kiếm để tránh gọi nhiều lần
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    applyFilters() {
      let results = [...this.bookings];
      
      // Tìm kiếm theo query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        results = results.filter(booking => {
          // Tìm theo mã đặt vé
          if (booking.bookingCode && booking.bookingCode.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm theo tên liên hệ
          if (booking.contactInfo && booking.contactInfo.name && 
              booking.contactInfo.name.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm theo email liên hệ
          if (booking.contactInfo && booking.contactInfo.email && 
              booking.contactInfo.email.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm theo số điện thoại liên hệ
          if (booking.contactInfo && booking.contactInfo.phoneNumber && 
              booking.contactInfo.phoneNumber.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm theo tên hành khách
          if (booking.passengers && booking.passengers.some(passenger => 
              passenger.name && passenger.name.toLowerCase().includes(query))) {
            return true;
          }
          
          return false;
        });
      }
      
      // Lọc theo trạng thái đặt vé
      if (this.filters.status) {
        results = results.filter(booking => booking.status === this.filters.status);
      }
      
      // Lọc theo trạng thái thanh toán
      if (this.filters.paymentStatus) {
        results = results.filter(booking => 
          booking.payment && booking.payment.status === this.filters.paymentStatus
        );
      }
      
      // Lọc theo giá thấp nhất
      if (this.filters.minPrice) {
        const minPrice = parseFloat(this.filters.minPrice);
        if (!isNaN(minPrice)) {
          results = results.filter(booking => booking.totalPrice >= minPrice);
        }
      }
      
      // Lọc theo giá cao nhất
      if (this.filters.maxPrice) {
        const maxPrice = parseFloat(this.filters.maxPrice);
        if (!isNaN(maxPrice)) {
          results = results.filter(booking => booking.totalPrice <= maxPrice);
        }
      }
      
      this.filteredBookings = results;
    },
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        status: '',
        paymentStatus: '',
        minPrice: '',
        maxPrice: ''
      };
      this.filteredBookings = [...this.bookings];
    }
  }
};
</script>

<style scoped>
/* Container */
.booking-list {
  font-family: "Lato", sans-serif;
}

/* Search and Filter Styles */
.search-filter-container {
  margin-bottom: 2rem;
  padding: 1.6rem;
  background: #f8fafc;
  border-radius: 0.8rem;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.05);
}

.search-box {
  display: flex;
  margin-bottom: 1.6rem;
}

.search-box input {
  flex: 1;
  padding: 1rem 1.2rem;
  border: 0.1rem solid #cbd5e1;
  border-radius: 0.6rem 0 0 0.6rem;
  font-size: 1.4rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #007bff;
}

.search-btn {
  padding: 1rem 1.6rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 0 0.6rem 0.6rem 0;
  font-size: 1.4rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #0056b3;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 180px;
}

.filter-group label {
  font-size: 1.4rem;
  color: #475569;
  font-weight: 600;
}

.filter-group select,
.filter-group input {
  padding: 0.8rem 1rem;
  border: 0.1rem solid #cbd5e1;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #007bff;
}

.reset-btn {
  padding: 0.8rem 1.6rem;
  background: #64748b;
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  cursor: pointer;
  transition: background 0.2s;
  height: fit-content;
}

.reset-btn:hover {
  background: #475569;
}

/* Loading State */
.loading {
  text-align: center;
  font-size: 1.6rem;
  color: #475569;
  padding: 2rem;
}

/* Table Styling */
.booking-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.8rem;
  overflow: hidden;
}

th,
td {
  padding: 1.2rem 1.6rem;
  text-align: left;
  font-size: 1.4rem;
  color: #334155;
  border-bottom: 0.1rem solid #e2e8f0;
}

th {
  background: #f1f5f9;
  font-weight: 600;
  color: #0f172a;
}

td {
  vertical-align: top;
}

td ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

td li {
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  color: #475569;
}

/* Feedback Messages */
.success {
  color: #28a745;
  font-size: 1.4rem;
  margin-top: 1.6rem;
  text-align: center;
  background: rgba(40, 167, 69, 0.1);
  padding: 1rem;
  border-radius: 0.6rem;
}

.error {
  color: #dc3545;
  font-size: 1.4rem;
  margin-top: 1.6rem;
  text-align: center;
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 0.6rem;
}

/* Empty State */
p {
  font-size: 1.6rem;
  color: #475569;
  text-align: center;
  padding: 2rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .booking-list {
    padding: 1.6rem;
  }

  .search-filter-container {
    padding: 1.2rem;
  }

  .search-box {
    flex-direction: column;
  }

  .search-box input {
    border-radius: 0.6rem;
    margin-bottom: 0.8rem;
  }

  .search-btn {
    border-radius: 0.6rem;
  }

  .filter-container {
    flex-direction: column;
    gap: 1.2rem;
  }

  .filter-group {
    width: 100%;
  }

  th,
  td {
    padding: 1rem;
    font-size: 1.3rem;
  }

  td li {
    font-size: 1.2rem;
  }
}

/* Custom Scrollbar */
.booking-table::-webkit-scrollbar {
  height: 0.8rem;
}

.booking-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

.booking-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

.booking-table::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.booking-list {
  animation: fadeIn 0.5s ease;
}
</style>