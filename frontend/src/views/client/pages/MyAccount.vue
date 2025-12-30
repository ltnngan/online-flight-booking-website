<!-- src/views/Account.vue -->
<template>
  <div class="account-page">
    <Navbar />

    <div class="container">
      <div class="account-content">
        <div class="profile-section">
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="avatar-container">
              <div class="avatar-wrapper">
                <img
                  :src="previewImage || (user.avatar ? user.avatar : '/images/default-avatar.png')"
                  alt="Avatar"
                  class="avatar-image"
                />
                <label for="avatar-upload" class="upload-icon">
                  <i class="fas fa-camera"></i>
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  @change="handleImageChange"
                  hidden
                />
              </div>
            </div>

            <div class="form-content">
              <div class="form-group">
                <label for="fullName">Họ và tên</label>
                <input
                  type="text"
                  id="fullName"
                  v-model="formData.fullName"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="user.email"
                  class="form-control"
                  disabled
                />
              </div>

              <div class="form-group">
                <label for="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  v-model="formData.phone"
                  class="form-control"
                />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Đang cập nhật...</span>
                  <span v-else>Cập nhật thông tin</span>
                </button>
                <button type="button" class="btn btn-danger" @click="confirmDeleteAccount">
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="tabs-section">
          <div class="tabs">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'upcoming' }"
              @click="activeTab = 'upcoming'"
            >
              Chuyến bay sắp tới
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'history' }"
              @click="activeTab = 'history'"
            >
              Lịch sử đặt vé
            </button>
          </div>
          <div class="tab-content">
            <UpcomingFlights
              v-if="activeTab === 'upcoming'"
              @success="showToast('success', $event)"
              @error="showToast('error', $event)"
            />
            <FlightHistory v-if="activeTab === 'history'" />
          </div>
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h2>Xác nhận xóa tài khoản</h2>
          <p>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
            <button class="btn btn-danger" @click="deleteAccount" :disabled="isDeletingAccount">
              <span v-if="isDeletingAccount">Đang xóa...</span>
              <span v-else>Xác nhận xóa</span>
            </button>
          </div>
        </div>
      </div>

      <div class="toast-container">
        <div
          v-for="(toast, index) in toasts"
          :key="index"
          class="toast"
          :class="toast.type"
          @click="removeToast(index)"
        >
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../../../components/client/AppHeader.vue';
import UpcomingFlights from '../../../components/client/UpcomingFlights.vue';
import FlightHistory from '../../../components/client/FlightHistory.vue';
import authService from '../../../services/client/auth.service';
import accountService from '../../../services/client/account.service';

export default {
  name: 'Account',
  components: {
    Navbar,
    UpcomingFlights,
    FlightHistory,
  },
  data() {
    return {
      user: {
        id: '',
        fullName: '',
        email: '',
        phone: '',
        avatar: '',
      },
      formData: {
        fullName: '',
        phone: '',
      },
      selectedFile: null,
      previewImage: null,
      isSubmitting: false,
      isDeletingAccount: false,
      showDeleteModal: false,
      activeTab: 'upcoming',
      toasts: [], 
    };
  },
  created() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const response = await accountService.getAccountInfo();
          console.log('Raw response from server:', response);
          if (response.success) {
            this.user = {
              id: currentUser.userId,
              fullName: response.user.fullName,
              email: response.user.email,
              phone: response.user.phone || '',
              avatar: response.user.avatar
                ? response.user.avatar.startsWith('http')
                  ? response.user.avatar
                  : `http://localhost:3000${response.user.avatar}`
                : '',
            };
            this.formData.fullName = response.user.fullName;
            this.formData.phone = response.user.phone || '';
            console.log('User data from server:', this.user);
          } else {
            throw new Error(response.message || 'Lỗi khi lấy dữ liệu người dùng');
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu người dùng:', error);
          this.$router.push('/login');
        }
      } else {
        this.$router.push('/login');
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async updateProfile() {
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('fullName', this.formData.fullName);
        formData.append('phone', this.formData.phone);

        if (this.selectedFile) {
          formData.append('avatar', this.selectedFile);
        }

        const response = await accountService.updateAccount(formData);

        const currentUser = authService.getCurrentUser();
        currentUser.fullName = response.user.fullName;
        currentUser.phone = response.user.phone;

        if (response.user.avatar) {
          currentUser.avatar = response.user.avatar;
        }

        if (!currentUser.id && currentUser.userId) {
          currentUser.id = currentUser.userId;
        }
        localStorage.setItem('user', JSON.stringify(currentUser));

        const updatedAvatar = response.user.avatar
          ? response.user.avatar.startsWith('http')
            ? response.user.avatar
            : `http://localhost:3000${response.user.avatar}`
          : this.user.avatar;

        this.user = {
          ...this.user,
          fullName: response.user.fullName,
          phone: response.user.phone,
          avatar: updatedAvatar,
        };

        this.showToast('success', 'Cập nhật thông tin thành công!');
        this.selectedFile = null;
        this.previewImage = null;
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        this.showToast('error', 'Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
      } finally {
        this.isSubmitting = false;
      }
    },
    confirmDeleteAccount() {
      this.showDeleteModal = true;
    },
    async deleteAccount() {
      this.isDeletingAccount = true;
      try {
        await accountService.deleteAccount();
        await authService.logout();
        this.$router.push({
          path: '/home',
          query: { message: 'Tài khoản của bạn đã được xóa thành công' },
        });
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        this.showToast('error', 'Không thể xóa tài khoản. Vui lòng thử lại sau.');
        this.showDeleteModal = false;
      } finally {
        this.isDeletingAccount = false;
      }
    },
    showToast(type, message) {
      this.toasts.push({ type, message });
      setTimeout(() => {
        this.removeToast(0);
      }, 5000); // Tự động xóa sau 5 giây
    },
    removeToast(index) {
      this.toasts.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background-color: #f4f6f9;
  font-family: 'Inter', sans-serif;
}

.container {
  max-width: 1000px;
  margin: 4rem 17%;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.profile-section {
  background-color: #ffffff;
  border-radius: 1.2rem;
  padding: 2.5rem;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.06);
}

.profile-form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.avatar-wrapper {
  position: relative;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #e8ecef;
  transition: border-color 0.3s ease;
}

.avatar-wrapper:hover {
  border-color: #4caf50;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 4rem;
  height: 4rem;
  background-color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.upload-icon:hover {
  background-color: #388e3c;
  transform: scale(1.1);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

label {
  font-size: 1.4rem;
  font-weight: 600;
  color: #34495e;
}

.form-control {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 1px solid #dfe4ea;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  background-color: #f8fafc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
  outline: none;
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #388e3c;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
  transform: none;
}

.btn-danger {
  background-color: #ef5350;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #607d8b;
  color: white;
}

.btn-secondary:hover {
  background-color: #455a64;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 1.2rem;
  padding: 2.5rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h2 {
  font-size: 1.8rem;
  color: #c62828;
  margin: 0 0 1.5rem;
}

.modal-content p {
  font-size: 1.4rem;
  color: #34495e;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
}

.tabs-section {
  background-color: #ffffff;
  border-radius: 1.2rem;
  padding: 2.5rem;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.06);
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e8ecef;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 1rem 2rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #34495e;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.tab-button:hover {
  color: #4caf50;
}

.tab-button.active {
  color: #4caf50;
  border-bottom: 2px solid #4caf50;
}

.tab-content {
  min-height: 200px;
}

.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toast {
  padding: 1rem 1.5rem;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  color: white;
  min-width: 200px;
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  animation: slideInToast 0.3s ease;
  transition: opacity 0.3s ease;
}

.toast.success {
  background-color: #4caf50;
}

.toast.error {
  background-color: #ef5350;
}

@keyframes slideInToast {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>