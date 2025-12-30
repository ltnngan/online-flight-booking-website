<template>
  <div class="user-list">
    <!-- Phần tìm kiếm và lọc -->
    <div class="search-filter-container">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm theo email, họ tên hoặc số điện thoại..." 
          @input="handleSearch"
        />
        <button class="search-btn">
          <i class="fas fa-search"></i> Tìm kiếm
        </button>
      </div>
      
      <div class="filter-container">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">Tất cả</option>
            <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        
        <button class="reset-btn" @click="resetFilters">
          Đặt lại
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Đang tải...</div>
    <div v-else-if="filteredUsers.length" class="user-table">
      <table>
        <thead>
          <tr>
            <th>Ảnh Đại Diện</th>
            <th>Email</th>
            <th>Họ Tên</th>
            <th>Số Điện Thoại</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user._id">
            <td>
              <img
                v-if="user.avatar"
                :src="getFullAvatarUrl(user.avatar)"
                alt="Ảnh Đại Diện"
                class="table-avatar"
                @error="handleImageError"
              />
              <span v-else>Không có ảnh đại diện</span>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.status }}</td>
            <td>
              <button @click="viewUserDetails(user._id)" class="view-btn">Xem</button>
              <button
                v-if="user.status !== 'banned'"
                @click="blockUser(user._id)"
                class="block-btn"
                :disabled="isBlocking"
              >
                Chặn
              </button>
              <button
                v-if="user.status === 'banned'"
                @click="unblockUser(user._id)"
                class="unblock-btn"
                :disabled="isUnblocking"
              >
                Gỡ Chặn
              </button>
              <button
                @click="deleteUser(user._id)"
                class="delete-btn"
                :disabled="isDeleting"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.</p>

    <!-- Modal chi tiết người dùng -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Chi tiết người dùng</h2>
          <button @click="closeModal" class="modal-close-btn">×</button>
        </div>
        <div v-if="selectedUser" class="user-details">
          <div class="user-details-card">
            <div class="avatar-section">
              <img
                v-if="selectedUser.avatar"
                :src="getFullAvatarUrl(selectedUser.avatar)"
                alt="Ảnh Đại Diện"
                class="user-avatar"
                @error="handleImageError"
              />
              <span v-else class="no-avatar">Không có ảnh đại diện</span>
            </div>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ selectedUser.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Họ Tên:</span>
                <span class="info-value">{{ selectedUser.fullName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Số Điện Thoại:</span>
                <span class="info-value">{{ selectedUser.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trạng Thái:</span>
                <span class="info-value">{{ selectedUser.status }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Ngày Tạo:</span>
                <span class="info-value">{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading">Đang tải chi tiết người dùng...</div>
        <div class="modal-footer">
          <button @click="closeModal" class="close-btn">Đóng</button>
        </div>
      </div>
    </div>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { getAllUsers, getOneUser, deleteUser, blockUser, unblockUser } from '../../../services/admin/user.service';

export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      filteredUsers: [],
      selectedUser: null,
      showModal: false,
      isLoading: false,
      isDeleting: false,
      isBlocking: false,
      isUnblocking: false,
      successMessage: '',
      errorMessage: '',
      baseUrl: 'http://localhost:3000',
      searchQuery: '',
      filters: {
        status: ''
      },
      searchTimeout: null
    };
  },
  created() {
    this.fetchUsers();
  },
  computed: {
    uniqueStatuses() {
      // Tạo danh sách các trạng thái duy nhất
      const statuses = new Set();
      this.users.forEach(user => {
        if (user.status) {
          statuses.add(user.status);
        }
      });
      return Array.from(statuses).sort();
    }
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await getAllUsers();
        this.users = response.data.data || [];
        this.filteredUsers = [...this.users]; // Khởi tạo danh sách đã lọc
      } catch (error) {
        this.errorMessage = 'Không thể tải danh sách người dùng. Vui lòng thử lại.';
      } finally {
        this.isLoading = false;
      }
    },
    async viewUserDetails(userId) {
      this.showModal = true;
      this.selectedUser = null;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await getOneUser(userId);
        this.selectedUser = response.data.data;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể tải chi tiết người dùng. Vui lòng thử lại.';
        this.showModal = false;
      }
    },
    async deleteUser(userId) {
      if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

      this.isDeleting = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await deleteUser(userId);
        this.successMessage = response.data.message || 'Xóa người dùng thành công!';
        await this.fetchUsers();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể xóa người dùng. Vui lòng thử lại.';
      } finally {
        this.isDeleting = false;
      }
    },
    async blockUser(userId) {
      if (!confirm('Bạn có chắc muốn chặn người dùng này?')) return;

      this.isBlocking = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await blockUser(userId);
        this.successMessage = response.data.message || 'Chặn người dùng thành công!';
        await this.fetchUsers();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể chặn người dùng. Vui lòng thử lại.';
      } finally {
        this.isBlocking = false;
      }
    },
    async unblockUser(userId) {
      if (!confirm('Bạn có chắc muốn gỡ chặn người dùng này?')) return;

      this.isUnblocking = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const response = await unblockUser(userId);
        this.successMessage = response.data.message || 'Gỡ chặn người dùng thành công!';
        await this.fetchUsers();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể gỡ chặn người dùng. Vui lòng thử lại.';
      } finally {
        this.isUnblocking = false;
      }
    },
    closeModal() {
      this.showModal = false;
      this.selectedUser = null;
    },
    formatDate(date) {
      return new Date(date).toLocaleString('vi-VN');
    },
    getFullAvatarUrl(avatarPath) {
      if (!avatarPath) return '';
      return `${this.baseUrl}${avatarPath}`;
    },
    handleImageError(event) {
      event.target.style.display = 'none';
      event.target.nextElementSibling.textContent = 'Không có ảnh đại diện';
    },
    handleSearch() {
      // Debounce tìm kiếm để tránh gọi nhiều lần
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    applyFilters() {
      let results = [...this.users];
      
      // Tìm kiếm theo query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        results = results.filter(user => {
          // Tìm trong email
          if (user.email && user.email.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm trong họ tên
          if (user.fullName && user.fullName.toLowerCase().includes(query)) {
            return true;
          }
          
          // Tìm trong số điện thoại
          if (user.phone && user.phone.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });
      }
      
      // Lọc theo trạng thái
      if (this.filters.status) {
        results = results.filter(user => user.status === this.filters.status);
      }
      
      this.filteredUsers = results;
    },
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        status: ''
      };
      this.filteredUsers = [...this.users];
    }
  }
};
</script>

<style scoped>
/* Container */
.user-list {
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
.user-table {
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
  vertical-align: middle;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1.2rem;
  box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.6rem;
}

.modal-title {
  font-size: 2rem;
  color: #0f172a;
  font-weight: 700;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #0f172a;
}

.user-details-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: #f8fafc;
  padding: 1.6rem;
  border-radius: 0.8rem;
  border: 0.1rem solid #e2e8f0;
}

.avatar-section {
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 0.2rem solid #e2e8f0;
  margin-bottom: 0.8rem;
}

.no-avatar {
  font-size: 1.4rem;
  color: #64748b;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-label {
  font-size: 1.4rem;
  font-weight: 600;
  color: #475569;
  min-width: 120px;
}

.info-value {
  font-size: 1.4rem;
  color: #334155;
  flex: 1;
}

.modal-footer {
  margin-top: 2rem;
  text-align: right;
}

/* Buttons */
.view-btn,
.delete-btn,
.block-btn,
.unblock-btn,
.close-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.8rem;
}

.view-btn {
  background: #007bff;
  color: #fff;
}

.view-btn:hover {
  background: #0056b3;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.block-btn {
  background: #ffc107;
  color: #212529;
}

.block-btn:hover {
  background: #e0a800;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.unblock-btn {
  background: #28a745;
  color: #fff;
}

.unblock-btn:hover {
  background: #218838;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.delete-btn,
.close-btn {
  background: #dc3545;
  color: #fff;
}

.delete-btn:hover,
.close-btn:hover {
  background: #c82333;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.delete-btn:disabled,
.block-btn:disabled,
.unblock-btn:disabled {
  background: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

/* Images */
.table-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 0.1rem solid #e2e8f0;
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
  .user-list {
    padding: 1.6rem;
  }

  .search-filter-container {
    padding: 1.2rem;
  }

 phenomena  .search-box {
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

  .view-btn,
  .delete-btn,
  .block-btn,
  .unblock-btn,
  .close-btn {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
  }

  .table-avatar {
    width: 36px;
    height: 36px;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .modal-content {
    padding: 1.6rem;
  }

  .info-label {
    min-width: 100px;
  }
}

/* Custom Scrollbar */
.user-table::-webkit-scrollbar {
  height: 0.8rem;
}

.user-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

.user-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

.user-table::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.user-list,
.modal-content {
  animation: fadeIn 0.5s ease;
}
</style>