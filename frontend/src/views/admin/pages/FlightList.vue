<template>
  <div class="flight-list">
    <!-- Search and Filter Section -->
    <div class="search-filter-container">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm theo mã chuyến bay hoặc tuyến bay..." 
          aria-label="Tìm kiếm chuyến bay"
          @input="handleSearch"
        />
        <button class="search-btn" aria-label="Tìm kiếm chuyến bay">
          <i class="fas fa-search"></i> Tìm kiếm
        </button>
      </div>
      
      <div class="filter-container">
        <div class="filter-group">
          <label for="route-filter">Tuyến bay:</label>
          <select 
            id="route-filter" 
            v-model="filters.route" 
            @change="applyFilters"
            aria-label="Lọc theo tuyến bay"
          >
            <option value="">Tất cả</option>
            <option v-for="route in uniqueRoutes" :key="route" :value="route">{{ route }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="date-range-picker">Ngày bay:</label>
          <input 
            id="date-range-picker"
            ref="dateRangePicker"
            type="text" 
            placeholder="Chọn khoảng ngày..."
            class="flatpickr-input"
            aria-label="Chọn khoảng ngày bay"
          />
        </div>
        
        <div class="filter-group">
          <label for="price-filter">Giá:</label>
          <select 
            id="price-filter" 
            v-model="filters.priceRange" 
            @change="applyFilters"
            aria-label="Lọc theo khoảng giá"
          >
            <option value="">Tất cả</option>
            <option value="0-1000000">Dưới 1,000,000 VND</option>
            <option value="1000000-2000000">1,000,000 - 2,000,000 VND</option>
            <option value="2000000-3000000">2,000,000 - 3,000,000 VND</option>
            <option value="3000000+">Trên 3,000,000 VND</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="status-filter">Trạng thái:</label>
          <select 
            id="status-filter" 
            v-model="filters.status" 
            @change="applyFilters"
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả</option>
            <option value="Đúng giờ">Đúng giờ</option>
            <option value="Trễ">Trễ</option>
            <option value="Hủy">Hủy</option>
          </select>
        </div>
        
        <button 
          class="reset-btn" 
          @click="resetFilters"
          aria-label="Đặt lại bộ lọc"
        >
          Đặt lại
        </button>
      </div>
    </div>

    <!-- Loading, Table, and Messages -->
    <div v-if="isLoading" class="loading">Đang tải...</div>
    <div v-else-if="filteredFlights.length" class="flight-table">
      <table>
        <thead>
          <tr>
            <th>Mã Chuyến Bay</th>
            <th>Tuyến Bay</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Giá Cơ Bản</th>
            <th>Hình Ảnh</th>
            <th>Trạng Thái</th>
            <th>Ghế</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="flight in filteredFlights" :key="flight._id">
            <td>{{ flight.flightCode }}</td>
            <td>{{ flight.fromCity }} - {{ flight.toCity }}</td>
            <td>{{ formatDate(flight.date) }}</td>
            <td>{{ flight.time }}</td>
            <td>{{ formatPrice(flight.basePrice) }}</td>
            <td>
              <img
                :src="getImageUrl(flight.image)"
                :alt="flight.flightCode"
                class="flight-image"
                loading="lazy"
                @error="handleImageError"
              />
            </td>
            <td>{{ flight.status || 'N/A' }}</td>
            <td>
              <ul>
                <li v-for="(seat, index) in flight.seats" :key="index">
                  {{ seat.category }}: {{ seat.available }}/{{ seat.total }} (x{{ seat.priceMultiplier }})
                </li>
              </ul>
            </td>
            <td>
              <router-link 
                :to="`/admin/flights/edit/${flight._id}`" 
                class="edit-btn"
                aria-label="Sửa chuyến bay"
              >
                Sửa
              </router-link>
              <button
                @click="deleteFlight(flight._id)"
                class="delete-btn"
                :disabled="isDeleting"
                aria-label="Xóa chuyến bay"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>Không tìm thấy chuyến bay nào phù hợp với điều kiện tìm kiếm.</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import { getAllFlights, deleteFlight } from '../../../services/admin/flight.service';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'; // Vietnamese localization

export default {
  name: 'FlightList',
  data() {
    return {
      flights: [],
      filteredFlights: [],
      isLoading: false,
      isDeleting: false,
      successMessage: '',
      errorMessage: '',
      searchQuery: '',
      filters: {
        route: '',
        dateFrom: '',
        dateTo: '',
        priceRange: '',
        status: ''
      },
      searchTimeout: null
    };
  },
  mounted() {
    // Initialize Flatpickr for date range
    flatpickr(this.$refs.dateRangePicker, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      locale: Vietnamese,
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          this.filters.dateFrom = selectedDates[0].toISOString().split('T')[0];
          this.filters.dateTo = selectedDates[1].toISOString().split('T')[0];
          this.applyFilters();
        }
      }
    });
  },
  created() {
    this.fetchFlights();
  },
  computed: {
    uniqueRoutes() {
      const routes = new Set();
      this.flights.forEach(flight => {
        routes.add(`${flight.fromCity} - ${flight.toCity}`);
      });
      return Array.from(routes);
    }
  },
  methods: {
    async fetchFlights() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await getAllFlights();
        this.flights = response.data.data || [];
        this.filteredFlights = [...this.flights];
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Không thể tải danh sách chuyến bay.';
      } finally {
        this.isLoading = false;
      }
    },
    async deleteFlight(flightId) {
      if (!confirm('Bạn có chắc muốn xóa chuyến bay này?')) return;
      this.isDeleting = true;
      this.errorMessage = '';
      try {
        const response = await deleteFlight(flightId);
        this.successMessage = response.data.message;
        await this.fetchFlights();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể xóa chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isDeleting = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    formatPrice(price) {
      return price ? price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A';
    },
    getImageUrl(imagePath) {
      return imagePath ? `http://localhost:3000${imagePath}` : '/images/placeholder.png';
    },
    handleImageError(event) {
      event.target.src = '/images/placeholder.png';
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    applyFilters() {
      let results = [...this.flights];
      
      // Validate date range
      if (this.filters.dateFrom && this.filters.dateTo) {
        const fromDate = new Date(this.filters.dateFrom);
        const toDate = new Date(this.filters.dateTo);
        if (fromDate > toDate) {
          this.errorMessage = 'Ngày bắt đầu không thể sau ngày kết thúc.';
          this.filteredFlights = [];
          return;
        } else {
          this.errorMessage = ''; // Clear error if valid
        }
      }
      
      // Search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        results = results.filter(flight => 
          flight.flightCode.toLowerCase().includes(query) || 
          `${flight.fromCity} - ${flight.toCity}`.toLowerCase().includes(query)
        );
      }
      
      // Route filter
      if (this.filters.route) {
        results = results.filter(flight => 
          `${flight.fromCity} - ${flight.toCity}` === this.filters.route
        );
      }
      
      // Date filter
      if (this.filters.dateFrom) {
        const fromDate = new Date(this.filters.dateFrom);
        results = results.filter(flight => new Date(flight.date) >= fromDate);
      }
      
      if (this.filters.dateTo) {
        const toDate = new Date(this.filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        results = results.filter(flight => new Date(flight.date) <= toDate);
      }
      
      // Price filter
      if (this.filters.priceRange) {
        const [min, max] = this.filters.priceRange.split('-');
        if (min && max) {
          results = results.filter(flight => 
            flight.basePrice >= parseInt(min) && flight.basePrice <= parseInt(max)
          );
        } else if (min && min.includes('+')) {
          const minPrice = parseInt(min);
          results = results.filter(flight => flight.basePrice >= minPrice);
        }
      }
      
      // Status filter
      if (this.filters.status) {
        results = results.filter(flight => flight.status === this.filters.status);
      }
      
      this.filteredFlights = results;
    },
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        route: '',
        dateFrom: '',
        dateTo: '',
        priceRange: '',
        status: ''
      };
      this.$refs.dateRangePicker._flatpickr.clear(); // Clear Flatpickr
      this.filteredFlights = [...this.flights];
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped>
/* General Container */
.flight-list {
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

.flatpickr-input {
  width: 100%;
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
.flight-table {
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

td ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

td li {
  font-size: 1.3rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.flight-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.6rem;
  border: 0.1rem solid #e2e8f0;
  transition: transform 0.2s ease;
}

.flight-image:hover {
  transform: scale(1.05);
}

/* Button Styling */
.edit-btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background: #007bff;
  color: #fff;
  border-radius: 0.6rem;
  text-decoration: none;
  font-size: 1.3rem;
  margin-right: 0.8rem;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #0056b3;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.delete-btn {
  padding: 0.6rem 1.2rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #c82333;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.delete-btn:disabled {
  background: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
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
  .flight-list {
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

  .flight-image {
    width: 60px;
    height: 45px;
  }

  .edit-btn,
  .delete-btn {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
  }
}

/* Custom Scrollbar */
.flight-table::-webkit-scrollbar {
  height: 0.8rem;
}

.flight-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

.flight-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

.flight-table::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.flight-list {
  animation: fadeIn 0.5s ease;
}
</style>