<template>
  <div class="create-flight">
    <form @submit.prevent="handleCreateFlight">
      <div class="form-group">
        <label for="fromCity">Thành Phố Đi</label>
        <select id="fromCity" v-model="flightForm.fromCity" @change="updateToCities" required>
          <option value="" disabled>Chọn thành phố</option>
          <option v-for="route in flightRoutes" :key="route._id" :value="route.fromCity">
            {{ route.fromCity }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="toCity">Thành Phố Đến</label>
        <select id="toCity" v-model="flightForm.toCity" required>
          <option value="" disabled>Chọn thành phố</option>
          <option v-for="city in availableToCities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
        <p v-if="!availableToCities.length && flightForm.fromCity" class="error">
          Không có thành phố đến khả dụng cho {{ flightForm.fromCity }}.
        </p>
      </div>
      <div class="form-group">
        <label for="date">Ngày Bay</label>
        <input id="date" type="text" v-model="flightForm.date" ref="datePicker" required />
      </div>
      <div class="form-group">
        <label for="time">Giờ Bay</label>
        <input id="time" type="time" v-model="flightForm.time" :min="minTime" required />
      </div>
      <div class="form-group">
        <label for="duration">Thời Gian Bay (phút)</label>
        <input
          id="duration"
          type="number"
          v-model="flightForm.duration"
          placeholder="Nhập thời gian (VD: 120)"
          min="1"
          required
        />
      </div>
      <div class="form-group">
        <label for="aircraft">Máy Bay</label>
        <select id="aircraft" v-model="flightForm.aircraft" required>
          <option value="" disabled>Chọn máy bay</option>
          <option v-for="aircraft in aircrafts" :key="aircraft" :value="aircraft">
            {{ aircraft }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="basePrice">Giá Cơ Bản</label>
        <input
          id="basePrice"
          type="number"
          v-model="flightForm.basePrice"
          placeholder="Nhập giá cơ bản (VD: 1000000)"
          min="0"
          required
        />
      </div>
      <div class="form-group">
  <label>Ghế Ngồi</label>
  <div v-for="(seat, index) in flightForm.seats" :key="index" class="seat-group">
    <div class="input-group">
      <label for="seat-category">Hạng Ghế</label>
      <select id="seat-category" v-model="seat.category" required>
        <option value="" disabled>Chọn hạng ghế</option>
        <option
          v-for="category in availableSeatCategories(index)"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>
    <div class="input-group">
      <label for="seat-available">Số Ghế Khả Dụng</label>
      <input
        id="seat-available"
        type="number"
        v-model="seat.available"
        placeholder="Số ghế khả dụng"
        min="0"
        required
      />
    </div>
    <div class="input-group">
      <label for="seat-total">Tổng Số Ghế</label>
      <input
        id="seat-total"
        type="number"
        v-model="seat.total"
        placeholder="Tổng số ghế"
        min="0"
        required
      />
    </div>
    <div class="input-group">
      <label for="seat-price-multiplier">Hệ Số Giá</label>
      <input
        id="seat-price-multiplier"
        type="number"
        v-model="seat.priceMultiplier"
        placeholder="Hệ số giá"
        min="0.1"
        step="0.1"
        required
      />
    </div>
    <button type="button" @click="removeSeat(index)" class="remove-seat">
      Xóa
    </button>
  </div>
  <button type="button" @click="addSeat" class="add-seat">Thêm Ghế</button>
</div>
      <div class="form-group">
        <label for="image">Hình Ảnh</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          @change="handleImageChange"
        />
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Xem trước" />
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="isCreating">Tạo Chuyến Bay</button>
        <button type="button" @click="resetForm">Đặt Lại</button>
        <router-link to="/admin/flights" class="cancel-btn">Hủy</router-link>
      </div>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { createFlight } from '../../../services/admin/flight.service';


import { getAllFlightRoutes } from '../../../services/admin/flight-route.service';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default {
  name: 'CreateFlight',
  data() {
    return {
      flightForm: {
        fromCity: '',
        toCity: '',
        date: '',
        time: '',
        duration: '',
        aircraft: '',
        basePrice: '',
        seats: [],
      },
      flightImage: null,
      imagePreview: null,
      flightRoutes: [],
      availableToCities: [],
      isCreating: false,
      successMessage: '',
      errorMessage: '',
      aircrafts: ['Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 787', 'ATR 72'],
      seatCategories: ['Economy', 'Deluxe', 'SkyBoss'],
      minTime: '',
    };
  },
  mounted() {
    this.fetchFlightRoutes();
    this.initializeFlatpickr();
    this.updateMinTime();
  },
  methods: {
    initializeFlatpickr() {
      const today = new Date();
      flatpickr(this.$refs.datePicker, {
        dateFormat: 'Y-m-d',
        minDate: today,
        onChange: (selectedDates, dateStr) => {
          this.flightForm.date = dateStr;
          this.updateMinTime();
        },
      });
    },
    updateMinTime() {
      const today = new Date();
      const selectedDate = this.flightForm.date
        ? new Date(this.flightForm.date)
        : null;
      if (
        selectedDate &&
        selectedDate.toDateString() === today.toDateString()
      ) {
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        this.minTime = `${hours}:${minutes}`;
        if (this.flightForm.time < this.minTime) {
          this.flightForm.time = '';
        }
      } else {
        this.minTime = '';
      }
    },
    async fetchFlightRoutes() {
      try {
        const response = await getAllFlightRoutes();
        console.log('Raw API response:', response);
        if (response.data && response.data.data) {
          this.flightRoutes = response.data.data;
          console.log('Flight routes loaded:', this.flightRoutes);
          if (this.flightRoutes.length > 0) {
            console.log('Sample route structure:', this.flightRoutes[0]);
          }
        } else {
          this.errorMessage = 'Dữ liệu tuyến bay không hợp lệ.';
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Không thể tải danh sách tuyến bay.';
      }
    },
    updateToCities() {
      const fromCity = this.flightForm.fromCity;
      console.log('Selected fromCity:', fromCity);

      const route = this.flightRoutes.find((r) => r.fromCity === fromCity);
      console.log('Found route:', route);

      if (route && route.toCity) {
        this.availableToCities = Array.isArray(route.toCity)
          ? [...route.toCity]
          : [route.toCity];
      } else {
        this.availableToCities = [];
        console.warn(`No valid toCity found for ${fromCity}`);
      }

      console.log('Available toCities:', this.availableToCities);

      if (!this.availableToCities.includes(this.flightForm.toCity)) {
        this.flightForm.toCity = '';
      }
    },
    availableSeatCategories(currentIndex) {
      const selectedCategories = this.flightForm.seats
        .filter((_, index) => index !== currentIndex)
        .map((seat) => seat.category);
      return this.seatCategories.filter(
        (category) => !selectedCategories.includes(category)
      );
    },
    async handleCreateFlight() {
      if (
        !this.flightForm.seats.length ||
        this.flightForm.seats.some((seat) => !seat.category)
      ) {
        this.errorMessage = 'Vui lòng thêm ít nhất một ghế hợp lệ với danh mục.';
        return;
      }
      if (
        this.flightForm.seats.some(
          (seat) =>
            seat.available > seat.total ||
            seat.available < 0 ||
            seat.total < 0
        )
      ) {
        this.errorMessage =
          'Số ghế khả dụng không được vượt quá tổng số ghế và không được âm.';
        return;
      }
      if (this.flightForm.seats.some((seat) => seat.priceMultiplier <= 0)) {
        this.errorMessage = 'Hệ số giá phải lớn hơn 0.';
        return;
      }
      if (
        !this.flightForm.fromCity ||
        !this.flightForm.toCity ||
        !this.flightForm.date ||
        !this.flightForm.time ||
        !this.flightForm.duration ||
        !this.flightForm.aircraft ||
        !this.flightForm.basePrice
      ) {
        this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc.';
        return;
      }
      if (this.flightForm.fromCity === this.flightForm.toCity) {
        this.errorMessage = 'Thành phố đi và đến phải khác nhau.';
        return;
      }
      if (this.flightForm.basePrice < 0 || this.flightForm.duration < 1) {
        this.errorMessage =
          'Giá cơ bản không được âm và thời gian bay phải lớn hơn 0.';
        return;
      }
      this.isCreating = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const flightData = {
          fromCity: this.flightForm.fromCity,
          toCity: this.flightForm.toCity,
          date: this.flightForm.date,
          time: this.flightForm.time,
          duration: Number(this.flightForm.duration),
          aircraft: this.flightForm.aircraft,
          basePrice: Number(this.flightForm.basePrice),
          seats: this.flightForm.seats.map((seat) => ({
            category: seat.category,
            available: Number(seat.available),
            total: Number(seat.total),
            priceMultiplier: Number(seat.priceMultiplier),
          })),
        };
        const response = await createFlight(flightData, this.flightImage);
        this.successMessage = response.data.message;
        this.resetForm();
        this.$router.push('/admin/flights');
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          'Không thể tạo chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isCreating = false;
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      this.flightImage = file;
      this.imagePreview = file ? URL.createObjectURL(file) : null;
    },
    addSeat() {
      if (this.flightForm.seats.length >= this.seatCategories.length) {
        this.errorMessage = 'Không thể thêm ghế: Đã sử dụng tất cả các hạng ghế.';
        return;
      }
      this.flightForm.seats.push({
        category: '',
        available: 0,
        total: 0,
        priceMultiplier: 1,
      });
    },
    removeSeat(index) {
      this.flightForm.seats.splice(index, 1);
    },
    resetForm() {
      this.flightForm = {
        fromCity: '',
        toCity: '',
        date: '',
        time: '',
        duration: '',
        aircraft: '',
        basePrice: '',
        seats: [],
      };
      this.flightImage = null;
      this.imagePreview = null;
      this.availableToCities = [];
      this.successMessage = '';
      this.errorMessage = '';
      this.minTime = '';
    },
  },
  watch: {
    'flightForm.date': function () {
      this.updateMinTime();
    },
  },
};
</script>

<style scoped>
.create-flight {
  font-family: "Lato", sans-serif;
}

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

.form-group input,
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

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #ffc107;
  box-shadow: 0 0 0.4rem rgba(255, 193, 7, 0.3);
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.seat-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.seat-group select,
.seat-group input {
  flex: 1;
  min-width: 0;
}

.add-seat,
.remove-seat {
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-seat {
  background: #f1f5f9;
  color: #334155;
  border: 0.1rem solid #e2e8f0;
}

.add-seat:hover {
  background: #ffc107;
  color: #0f172a;
  border-color: #ffc107;
}

.remove-seat {
  background: #dc3545;
  color: #fff;
  border: none;
}

.remove-seat:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  gap: 1.6rem;
  margin-top: 2rem;
}

.form-actions button,
.cancel-btn {
  padding: 0.8rem 1.6rem;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
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

.cancel-btn {
  background: #dc3545;
  color: #fff;
  text-decoration: none;
  border: none;
}

.cancel-btn:hover {
  background: #c82333;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.1);
}

.image-preview {
  margin-top: 1rem;
}

.image-preview img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 0.6rem;
  border: 0.1rem solid #e2e8f0;
}

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
  margin-top: 1rem;
  text-align: center;
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 0.6rem;
}

@media (max-width: 768px) {
  .create-flight {
    padding: 1.6rem;
  }

  .seat-group {
    flex-direction: column;
    align-items: stretch;
  }

  .seat-group select,
  .seat-group input {
    margin-bottom: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button,
  .cancel-btn {
    width: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.create-flight {
  animation: fadeIn 0.5s ease;
}

.input-group {
  width: 100%;
}

.seat-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}
</style>