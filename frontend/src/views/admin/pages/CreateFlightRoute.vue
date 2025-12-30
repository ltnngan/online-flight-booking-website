<template>
  <div class="create-flight-route">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="fromCity">Thành Phố Đi</label>
        <select
          id="fromCity"
          v-model="form.fromCity"
          required
        >
          <option value="" disabled>Chọn thành phố đi</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="toCity">Thành Phố Đến</label>
        <select
          id="toCity"
          v-model="toCityInput"
          @change="addToCity"
        >
          <option value="" disabled>Chọn thành phố đến</option>
          <option v-for="city in availableToCities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      <div class="to-cities" v-if="form.toCity.length">
        <label>Thành Phố Đến Đã Chọn</label>
        <ul>
          <li v-for="(city, index) in form.toCity" :key="index">
            {{ city }}
            <button type="button" @click="removeToCity(index)" class="remove-btn">Xóa</button>
          </li>
        </ul>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">Tạo Tuyến Bay</button>
        <button type="button" @click="resetForm">Đặt Lại</button>
      </div>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { createFlightRoute } from '../../../services/admin/flight-route.service';

export default {
  name: 'CreateFlightRoute',
  data() {
    return {
      form: {
        fromCity: '',
        toCity: [],
      },
      toCityInput: '',
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
      cities: [
        'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh',
        'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
        'Cao Bằng', 'Cần Thơ', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
        'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương',
        'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang',
        'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
        'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
        'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La',
        'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang',
        'TP. Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
      ],
    };
  },
  computed: {
    availableToCities() {
      return this.cities.filter(
        city => city !== this.form.fromCity && !this.form.toCity.includes(city)
      );
    },
  },
  methods: {
    addToCity() {
      if (this.toCityInput) {
        this.form.toCity.push(this.toCityInput);
        this.toCityInput = '';
      }
    },
    removeToCity(index) {
      this.form.toCity.splice(index, 1);
    },
    async handleSubmit() {
      if (!this.form.fromCity || !this.form.toCity.length) {
        this.errorMessage = 'Vui lòng chọn thành phố đi và ít nhất một thành phố đến.';
        return;
      }

      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const response = await createFlightRoute(this.form);
        this.successMessage = response.data.message || 'Tạo tuyến bay thành công!';
        this.resetForm();
        this.$router.push('/admin/flight-routes/get');
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Không thể tạo tuyến bay. Vui lòng thử lại.';
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.form.fromCity = '';
      this.form.toCity = [];
      this.toCityInput = '';
      this.successMessage = '';
      this.errorMessage = '';
    },
  },
};
</script>

<style scoped>
/* Form Container */
.create-flight-route {
  font-family: "Lato", sans-serif;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.6rem;
}

.form-group label {
  display: block;
  font-size: 1.4rem;
  color: #334155;
  font-weight: 500;
  margin-bottom: 0.6rem;
}

.form-group select {
  width: 100%;
  padding: 1rem;
  border: 0.1rem solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: #334155;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.form-group select:focus {
  outline: none;
  border-color: #ffc107;
  box-shadow: 0 0 0.4rem rgba(255, 193, 7, 0.3);
}

/* Destination Cities List */
.to-cities {
  margin-bottom: 1.6rem;
}

.to-cities label {
  display: block;
  font-size: 1.4rem;
  color: #334155;
  font-weight: 500;
  margin-bottom: 0.8rem;
}

.to-cities ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.to-cities li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #f8fafc;
  border: 0.1rem solid #e2e8f0;
  margin-bottom: 0.8rem;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  color: #475569;
}

/* Buttons */
.remove-btn {
  padding: 0.6rem 1.2rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #c82333;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 1.6rem;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.8rem 1.6rem;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.form-actions button[type="submit"] {
  background: #ffc107;
  color: #0f172a;
  border: none;
}

.form-actions button[type="submit"]:hover {
  background: #e0a800;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.1);
}

.form-actions button[type="submit"]:disabled {
  background: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

.form-actions button[type="button"] {
  background: #f1f5f9;
  color: #334155;
  border: 0.1rem solid #e2e8f0;
}

.form-actions button[type="button"]:hover {
  background: #e2e8f0;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.1);
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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .create-flight-route {
    padding: 1.6rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .to-cities li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.create-flight-route {
  animation: fadeIn 0.5s ease;
}
</style>