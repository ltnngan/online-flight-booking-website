<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i class="fas fa-plane"></i>
        </div>
        <h2>Đăng nhập</h2>
        <p class="subtitle">Đăng nhập để đặt vé và quản lý chuyến bay của bạn</p>
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
              v-model="user.email"
              type="email"
              id="email"
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="password-label-group">
            <label for="password">Mật khẩu</label>
            <a href="#" class="forgot-password">Quên mật khẩu?</a>
          </div>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              v-model="user.password"
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
        </div>
        
        <div class="remember-me">
          <label class="checkbox-container">
            <input type="checkbox" />
            <span class="checkmark"></span>
            Ghi nhớ đăng nhập
          </label>
        </div>
        
        <div class="form-group">
          <button class="btn-login" :disabled="loading">
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
            </span>
            <span v-else>Đăng nhập</span>
          </button>
        </div>
        
        <div class="social-login">
          <p>Hoặc đăng nhập bằng</p>
          <div class="social-buttons">
            <button type="button" class="btn-social google">
              <i class="fab fa-google"></i>
            </button>
            <button type="button" class="btn-social facebook">
              <i class="fab fa-facebook-f"></i>
            </button>
          </div>
        </div>
        
        <div class="register-link">
          <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '../../../services/client/auth.service';

export default {
  name: 'Login',
  data() {
    return {
      user: {
        email: '',
        password: ''
      },
      loading: false,
      message: ''
    };
  },
  created() {
    // Nếu người dùng đã đăng nhập, chuyển hướng đến trang chủ
    if (authService.isLoggedIn()) {
      this.$router.push('/home');
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.message = '';
      
      try {
        const response = await authService.login(this.user);
        
        // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
        this.$router.push('/home');
      } catch (error) {
        this.message = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9e9e9 100%);
  font-family: 'Roboto', sans-serif;
}

.login-card {
  width: 430px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 35px;
  transition: all 0.3s ease;
}

.login-header {
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

.login-header h2 {
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
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  color: #856404;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-message i {
  margin-right: 10px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
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
input[type="password"] {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  background-color: white;
  outline: none;
}

.password-label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 13px;
  color: #ffc107;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.remember-me {
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

.btn-login {
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

.btn-login:hover {
  background-color: #ffb300;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(255, 193, 7, 0.3);
}

.btn-login:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.social-login {
  margin-top: 25px;
  text-align: center;
}

.social-login p {
  color: #777;
  position: relative;
  font-size: 14px;
  margin-bottom: 15px;
}

.social-login p:before,
.social-login p:after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #eee;
}

.social-login p:before {
  left: 0;
}

.social-login p:after {
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

.register-link {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #ffc107;
  font-weight: 500;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    padding: 20px;
  }
}
</style>