<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i class="fas fa-plane"></i>
        </div>
        <h2>Đăng nhập Admin</h2>
        <p class="subtitle">Đăng nhập để quản lý hệ thống</p>
      </div>

      <div v-if="message" class="alert-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ message }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input
              v-model="admin.email"
              type="email"
              id="email"
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              v-model="admin.password"
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <!-- Thêm type="submit" để kích hoạt sự kiện submit -->
          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
            </span>
            <span v-else>Đăng nhập</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '../../../services/admin/auth.service';

export default {
  name: 'AdminLogin',
  data() {
    return {
      admin: {
        email: '',
        password: '',
      },
      loading: false,
      message: '',
    };
  },
  created() {
    // Log trạng thái loading ban đầu
    console.log('Initial loading state:', this.loading);
    // Kiểm tra nếu admin đã đăng nhập, chuyển hướng đến dashboard
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      this.$router.push('/admin');
    }
  },
  watch: {
    // Log khi email hoặc password thay đổi
    'admin.email': function (newVal) {
      console.log('Email updated:', newVal);
    },
    'admin.password': function (newVal) {
      console.log('Password updated:', newVal);
    },
  },
  methods: {
    async handleLogin() {
      console.log('handleLogin called');
      console.log('Email sent:', this.admin.email);
      console.log('Password sent:', this.admin.password);

      this.loading = true;
      this.message = '';

      try {
        const response = await authService.login(this.admin.email, this.admin.password);
        console.log('Login response:', response.data);

        // Kiểm tra nếu response có đúng cấu trúc từ API
        if (response && response.data && response.data.data) {
          const adminData = {
            adminId: response.data.data.adminId,
            email: response.data.data.email,
            fullName: response.data.data.fullName,
            accessToken: response.data.data.accessToken,
          };

          localStorage.setItem('admin', JSON.stringify(adminData));
          console.log('Admin data saved to localStorage:', adminData);
          this.$router.push('/admin/dashboard');
        } else {
          throw new Error('Dữ liệu đăng nhập không hợp lệ');
        }
      } catch (error) {
        console.error('Login error:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        this.message = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      } finally {
        this.loading = false;
        console.log('Loading state after login:', this.loading);
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9e9e9 100%);
  font-family: 'Roboto', sans-serif;
}

.login-card {
  width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  background-color: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo i {
  font-size: 24px;
  color: white;
}

.login-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #333;
}

.subtitle {
  font-size: 13px;
  color: #777;
  margin-top: 5px;
}

.alert-message {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  color: #856404;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 13px;
}

.alert-message i {
  margin-right: 8px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9f9f9;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  background-color: white;
  outline: none;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #ffc107;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
}

.btn-login:hover {
  background-color: #ffb300;
}

.btn-login:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}
</style>