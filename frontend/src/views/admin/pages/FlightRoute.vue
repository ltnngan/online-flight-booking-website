<template>
  <div class="flight-route-list">
    <!-- Phần tìm kiếm và lọc -->
    <div class="search-filter-container">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm theo thành phố đi hoặc thành phố đến..." 
          @input="handleSearch"
        />
        <button class="search-btn">
          <i class="fas fa-search"></i> Tìm kiếm
        </button>
      </div>
      
      <div class="filter-container">
        <div class="filter-group">
          <label>Thành phố đi:</label>
          <select v-model="filters.fromCity" @change="applyFilters">
            <option value="">Tất cả</option>
            <option v-for="city in uniqueFromCities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Số điểm đến:</label>
          <select v-model="filters.destinationCount" @change="applyFilters">
            <option value="">Tất cả</option>
            <option value="1">1 điểm đến</option>
            <option value="2-5">2-5 điểm đến</option>
            <option value="5+">Trên 5 điểm đến</option>
          </select>
        </div>
        
        <button class="reset-btn" @click="resetFilters">
          Đặt lại
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Đang tải...</div>
    <div v-else-if="filteredRoutes.length" class="route-table">
      <table>
        <thead>
          <tr>
            <th>Thành Phố Đi</th>
            <th>Thành Phố Đến</th>
            <th style="text-align: center">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in filteredRoutes" :key="route._id">
            <td>{{ route.fromCity }}</td>
            <td>
              <ul>
                <li v-for="(city, index) in route.toCity" :key="index">
                  {{ city }}
                  <button
                    @click="deleteToCity(route._id, index)"
                    class="remove-btn"
                    :disabled="isEditing"
                  >
                    Xóa
                  </button>
                </li>
              </ul>
            </td>
            <td style="text-align: center">
              <button
                @click="deleteFlightRoute(route._id)"
                class="delete-btn"
                :disabled="isDeleting"
              >
                Xóa Tuyến
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>Không tìm thấy tuyến bay nào phù hợp với điều kiện tìm kiếm.</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { getAllFlightRoutes, editFlightRoute, deleteFlightRoute } from '../../../services/admin/flight-route.service';

export default {
  name: 'FlightRouteList',
  data() {
    return {
      flightRoutes: [],
      filteredRoutes: [],
      isLoading: false,
      isEditing: false,
      isDeleting: false,
      successMessage: '',
      errorMessage: '',
      searchQuery: '',
      filters: {
        fromCity: '',
        destinationCount: ''
      },
      searchTimeout: null
    };
  },
  created() {
    this.fetchFlightRoutes();
  },
  computed: {
    uniqueFromCities() {
      // Tạo danh sách các thành phố đi duy nhất
      const cities = new Set();
      this.flightRoutes.forEach(route => {
        cities.add(route.fromCity);
      });
      return Array.from(cities).sort();
    }
  },
  methods: {
    async fetchFlightRoutes() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await getAllFlightRoutes();
        this.flightRoutes = response.data.data || [];
        this.filteredRoutes = [...this.flightRoutes]; // Khởi tạo danh sách đã lọc
      } catch (error) {
        this.errorMessage = 'Không thể tải danh sách tuyến bay. Vui lòng thử lại.';
      } finally {
        this.isLoading = false;
      }
    },
    async deleteToCity(routeId, toCityIndex) {
      if (!confirm('Bạn có chắc muốn xóa thành phố đến này?')) return;

      this.isEditing = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await editFlightRoute(routeId, { toCityIndex });
        this.successMessage = response.data.message || 'Xóa thành phố đến thành công!';
        await this.fetchFlightRoutes();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể xóa thành phố đến. Vui lòng thử lại.';
      } finally {
        this.isEditing = false;
      }
    },
    async deleteFlightRoute(routeId) {
      if (!confirm('Bạn có chắc muốn xóa tuyến bay này?')) return;

      this.isDeleting = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await deleteFlightRoute(routeId);
        this.successMessage = response.data.message || 'Xóa tuyến bay thành công!';
        await this.fetchFlightRoutes();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể xóa tuyến bay. Vui lòng thử lại.';
      } finally {
        this.isDeleting = false;
      }
    },
    handleSearch() {
      // Debounce tìm kiếm để tránh gọi nhiều lần
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    applyFilters() {
      let results = [...this.flightRoutes];
      
      // Tìm kiếm theo query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        results = results.filter(route => {
          // Tìm trong thành phố đi
          if (route.fromCity.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm trong các thành phố đến
          for (const city of route.toCity) {
            if (city.toLowerCase().includes(query)) {
              return true;
            }
          }
          
          return false;
        });
      }
      
      // Lọc theo thành phố đi
      if (this.filters.fromCity) {
        results = results.filter(route => route.fromCity === this.filters.fromCity);
      }
      
      // Lọc theo số điểm đến
      if (this.filters.destinationCount) {
        if (this.filters.destinationCount === '1') {
          results = results.filter(route => route.toCity.length === 1);
        } else if (this.filters.destinationCount === '2-5') {
          results = results.filter(route => route.toCity.length >= 2 && route.toCity.length <= 5);
        } else if (this.filters.destinationCount === '5+') {
          results = results.filter(route => route.toCity.length > 5);
        }
      }
      
      this.filteredRoutes = results;
    },
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        fromCity: '',
        destinationCount: ''
      };
      this.filteredRoutes = [...this.flightRoutes];
    }
  }
};
</script>

<style scoped>
/* Container */
.flight-route-list {
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
.route-table {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1.3rem;
  color: #475569;
}

/* Buttons */
.remove-btn,
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

.remove-btn:hover,
.delete-btn:hover {
  background: #c82333;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.remove-btn:disabled,
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
  .flight-route-list {
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

  .remove-btn,
  .delete-btn {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
  }

  td li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Custom Scrollbar */
.route-table::-webkit-scrollbar {
  height: 0.8rem;
}

.route-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

.route-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

.route-table::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.flight-route-list {
  animation: fadeIn 0.5s ease;
}
</style>