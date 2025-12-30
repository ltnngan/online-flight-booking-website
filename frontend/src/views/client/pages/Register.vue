<!-- src/views/Register.vue -->
<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <i class="fas fa-plane"></i>
        </div>
        <h2>Đăng ký tài khoản</h2>
        <p class="subtitle">Tạo tài khoản để đặt vé máy bay và nhận ưu đãi</p>
      </div>
      
      <div v-if="message" :class="['alert-message', successful ? 'alert-success' : 'alert-danger']">
        <i :class="successful ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ message }}
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input
                v-model="user.email"
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
                v-model="user.password"
                type="password"
                id="password"
                placeholder="Tạo mật khẩu mới"
                required
              />
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="fullName">Họ và tên</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input
                v-model="user.fullName"
                type="text"
                id="fullName"
                placeholder="Nhập họ và tên"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <div class="input-wrapper">
              <i class="fas fa-phone-alt"></i>
              <input
                v-model="user.phone"
                type="text"
                id="phone"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
          </div>
        </div>
        
        <div class="terms-privacy">
          <label class="checkbox-container">
            <input type="checkbox" required />
            <span class="checkmark"></span>
            Tôi đồng ý với&nbsp;<a href="#">Điều khoản dịch vụ</a>&nbsp;và&nbsp;<a href="#">Chính sách bảo mật</a>
          </label>
        </div>
        
        <div class="form-group">
          <button class="btn-register" :disabled="loading">
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
            </span>
            <span v-else>Đăng ký ngay</span>
          </button>
        </div>
        
        <div class="social-register">
          <p>Hoặc đăng ký với</p>
          <div class="social-buttons">
            <button type="button" class="btn-social google">
              <i class="fab fa-google"></i>
            </button>
            <button type="button" class="btn-social facebook">
              <i class="fab fa-facebook-f"></i>
            </button>
          </div>
        </div>
        
        <div class="login-link">
          <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '../../../services/client/auth.service';

export default {
  name: 'Register',
  data() {
    return {
      user: {
        email: '',
        password: '',
        fullName: '',
        phone: ''
      },
      loading: false,
      message: '',
      successful: false
    };
  },
  methods: {
    async handleRegister() {
      this.message = '';
      this.loading = true;
      
      try {
        const response = await authService.register(this.user);
        this.message = response.message || 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...';
        this.successful = true;
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        this.message = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        this.successful = false;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9e9e9 100%);
  font-family: 'Roboto', sans-serif;
  padding: 20px;
}

.register-card {
  width: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 35px;
  transition: all 0.3s ease;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 15px;
  background-color: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo i {
  font-size: 28px;
  color: white;
}

.register-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #777;
  margin-top: 8px;
}

.alert-message {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-message i {
  margin-right: 10px;
  font-size: 16px;
}

.alert-success {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.alert-danger {
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  color: #856404;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

input[type="email"]:focus,
input[type="password"]:focus,
input[type="text"]:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  background-color: white;
  outline: none;
}

.terms-privacy {
  margin-bottom: 25px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.checkbox-container a {
  color: #ffc107;
  text-decoration: none;
  font-weight: 500;
}

.checkbox-container a:hover {
  text-decoration: underline;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  display: inline-block;
  height: 18px;
  width: 18px;
  min-width: 18px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-right: 10px;
}

.checkbox-container:hover .checkmark {
  background-color: #e9e9e9;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #ffc107;
  border-color: #ffc107;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.btn-register {
  width: 100%;
  padding: 14px;
  background-color: #ffc107;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(255, 193, 7, 0.2);
}

.btn-register:hover {
  background-color: #ffb300;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(255, 193, 7, 0.3);
}

.btn-register:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.social-register {
  margin-top: 25px;
  text-align: center;
}

.social-register p {
  color: #777;
  position: relative;
  font-size: 14px;
  margin-bottom: 15px;
}

.social-register p:before,
.social-register p:after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #eee;
}

.social-register p:before {
  left: 0;
}

.social-register p:after {
  right: 0;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-social {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-social:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-social.google {
  color: #EA4335;
}

.btn-social.facebook {
  color: #1877F2;
}

.btn-social i {
  font-size: 18px;
}

.login-link {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #ffc107;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-card {
    width: 100%;
    padding: 25px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .register-card {
    border-radius: 0;
    box-shadow: none;
    padding: 20px;
  }
}
</style>