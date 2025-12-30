<template>
  <div class="create-flight">
    <form @submit.prevent="handleEditFlight">
      <div v-if="isLoading" class="loading">Đang tải...</div>
      <div v-else>
        <div class="form-group">
          <label for="flightCode">Mã Chuyến Bay</label>
          <input
            id="flightCode"
            v-model="editForm.flightCode"
            placeholder="Mã chuyến bay"
            readonly
          />
        </div>
        <div class="form-group">
          <label for="fromCity">Thành Phố Đi</label>
          <select id="fromCity" v-model="editForm.fromCity" @change="updateToCities" required>
            <option value="" disabled>Chọn thành phố</option>
            <option v-for="route in flightRoutes" :key="route._id" :value="route.fromCity">
              {{ route.fromCity }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="toCity">Thành Phố Đến</label>
          <select id="toCity" v-model="editForm.toCity" required>
            <option value="" disabled>Chọn thành phố</option>
            <option v-for="city in availableToCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <p v-if="!availableToCities.length && editForm.fromCity" class="error">
            Không có thành phố đến khả dụng cho {{ editForm.fromCity }}.
          </p>
        </div>
        <div class="form-group">
          <label for="date">Ngày Bay</label>
          <input id="date" type="text" v-model="editForm.date" ref="datePicker" required />
        </div>
        <div class="form-group">
          <label for="time">Giờ Bay</label>
          <input id="time" type="time" v-model="editForm.time" required />
        </div>
        <div class="form-group">
          <label for="duration">Thời Gian Bay (phút)</label>
          <input
            id="duration"
            type="number"
            v-model="editForm.duration"
            placeholder="Nhập thời gian (VD: 120)"
            min="1"
            required
          />
        </div>
        <div class="form-group">
          <label for="aircraft">Máy Bay</label>
          <select id="aircraft" v-model="editForm.aircraft" required>
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
            v-model="editForm.basePrice"
            placeholder="Nhập giá cơ bản (VD: 1000000)"
            min="0"
            required
          />
        </div>
        <div class="form-group">
          <label>Ghế Ngồi</label>
          <div v-for="(seat, index) in editForm.seats" :key="index" class="seat-group">
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
          <div v-else-if="editForm.image" class="image-preview">
            <img :src="getImageUrl(editForm.image)" alt="Hình ảnh hiện tại" />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="isEditing">Lưu Chuyến Bay</button>
          <button type="button" @click="resetForm">Đặt Lại</button>
          <router-link to="/admin/flights" class="cancel-btn">Hủy</router-link>
        </div>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script>
import { getAllFlights, editFlight } from '../../../services/admin/flight.service';
import { getAllFlightRoutes } from '../../../services/admin/flight-route.service';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default {
  name: 'EditFlight',
  data() {
    return {
      editForm: {
        id: '',
        flightCode: '',
        fromCity: '',
        toCity: '',
        date: '',
        time: '',
        duration: '',
        aircraft: '',
        basePrice: '',
        seats: [],
        image: '',
      },
      flightImage: null,
      imagePreview: null,
      flightRoutes: [],
      availableToCities: [],
      isLoading: false,
      isEditing: false,
      successMessage: '',
      errorMessage: '',
      aircrafts: ['Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 787', 'ATR 72'],
      seatCategories: ['Economy', 'Deluxe', 'SkyBoss'],
      minTime: '',
    };
  },
  created() {
    this.fetchFlightRoutes();
    this.fetchFlight();
  },
  mounted() {
    this.initializeFlatpickr();
    this.updateMinTime();
  },
  methods: {
    initializeFlatpickr() {
      setTimeout(() => {
        if (this.$refs.datePicker) {
          const today = new Date();
          flatpickr(this.$refs.datePicker, {
            dateFormat: 'Y-m-d',
            minDate: today,
            defaultDate: this.editForm.date,
            onChange: (selectedDates, dateStr) => {
              this.editForm.date = dateStr;
              this.updateMinTime();
            },
          });
        }
      }, 500); // Đợi sau khi dữ liệu đã được tải
    },
    updateMinTime() {
      const today = new Date();
      const selectedDate = this.editForm.date
        ? new Date(this.editForm.date)
        : null;
      if (
        selectedDate &&
        selectedDate.toDateString() === today.toDateString()
      ) {
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        this.minTime = `${hours}:${minutes}`;
        if (this.editForm.time < this.minTime) {
          this.editForm.time = '';
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
    async fetchFlight() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await getAllFlights();
        const flight = response.data.data.find(f => f._id === this.$route.params.id);
        if (flight) {
          this.editForm = {
            id: flight._id,
            flightCode: flight.flightCode,
            fromCity: flight.fromCity,
            toCity: flight.toCity,
            date: new Date(flight.date).toISOString().split('T')[0],
            time: flight.time,
            duration: flight.duration,
            aircraft: flight.aircraft,
            basePrice: flight.basePrice,
            seats: flight.seats.map(seat => ({
              category: seat.category,
              available: seat.available,
              total: seat.total,
              priceMultiplier: seat.priceMultiplier,
            })),
            image: flight.image,
          };
          this.updateToCities();
          this.initializeFlatpickr(); // Khởi tạo lại flatpickr sau khi có dữ liệu
        } else {
          this.errorMessage = 'Không tìm thấy chuyến bay.';
          this.$router.push('/admin/flights');
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Không thể tải thông tin chuyến bay.';
        this.$router.push('/admin/flights');
      } finally {
        this.isLoading = false;
      }
    },
    updateToCities() {
      const fromCity = this.editForm.fromCity;
      console.log('Selected fromCity:', fromCity);

      const route = this.flightRoutes.find(r => r.fromCity === fromCity);
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

      if (!this.availableToCities.includes(this.editForm.toCity)) {
        this.editForm.toCity = '';
      }
    },
    availableSeatCategories(currentIndex) {
      const selectedCategories = this.editForm.seats
        .filter((_, index) => index !== currentIndex)
        .map((seat) => seat.category);
      return this.seatCategories.filter(
        (category) => !selectedCategories.includes(category)
      );
    },
    async handleEditFlight() {
      if (
        !this.editForm.seats.length ||
        this.editForm.seats.some((seat) => !seat.category)
      ) {
        this.errorMessage = 'Vui lòng thêm ít nhất một ghế hợp lệ với danh mục.';
        return;
      }
      if (
        this.editForm.seats.some(
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
      if (this.editForm.seats.some((seat) => seat.priceMultiplier <= 0)) {
        this.errorMessage = 'Hệ số giá phải lớn hơn 0.';
        return;
      }
      if (
        !this.editForm.fromCity ||
        !this.editForm.toCity ||
        !this.editForm.date ||
        !this.editForm.time ||
        !this.editForm.duration ||
        !this.editForm.aircraft ||
        !this.editForm.basePrice
      ) {
        this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc.';
        return;
      }
      if (this.editForm.fromCity === this.editForm.toCity) {
        this.errorMessage = 'Thành phố đi và đến phải khác nhau.';
        return;
      }
      if (this.editForm.basePrice < 0 || this.editForm.duration < 1) {
        this.errorMessage =
          'Giá cơ bản không được âm và thời gian bay phải lớn hơn 0.';
        return;
      }
      this.isEditing = true;
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const flightData = {
          fromCity: this.editForm.fromCity,
          toCity: this.editForm.toCity,
          date: this.editForm.date,
          time: this.editForm.time,
          duration: Number(this.editForm.duration),
          aircraft: this.editForm.aircraft,
          basePrice: Number(this.editForm.basePrice),
          seats: this.editForm.seats.map((seat) => ({
            category: seat.category,
            available: Number(seat.available),
            total: Number(seat.total),
            priceMultiplier: Number(seat.priceMultiplier),
          })),
        };
        const response = await editFlight(this.editForm.id, flightData, this.flightImage);
        this.successMessage = response.data.message;
        setTimeout(() => {
          this.$router.push('/admin/flights');
        }, 1500);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          'Không thể cập nhật chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isEditing = false;
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      this.flightImage = file;
      this.imagePreview = file ? URL.createObjectURL(file) : null;
    },
    addSeat() {
      if (this.editForm.seats.length >= this.seatCategories.length) {
        this.errorMessage = 'Không thể thêm ghế: Đã sử dụng tất cả các hạng ghế.';
        return;
      }
      this.editForm.seats.push({
        category: '',
        available: 0,
        total: 0,
        priceMultiplier: 1,
      });
    },
    removeSeat(index) {
      this.editForm.seats.splice(index, 1);
    },
    getImageUrl(imagePath) {
      return imagePath ? `http://localhost:3000${imagePath}` : '/images/placeholder.png';
    },
    resetForm() {
      this.fetchFlight(); // Tải lại dữ liệu ban đầu
      this.flightImage = null;
      this.imagePreview = null;
      this.successMessage = '';
      this.errorMessage = '';
    },
  },
  watch: {
    'editForm.date': function() {
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

.form-group input[readonly] {
  background: #f1f1f1;
  cursor: not-allowed;
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.seat-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-end;
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
  display: flex;
  align-items: center;
  justify-content: center;
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

.loading {
  color: #334155;
  font-size: 1.4rem;
  margin: 2rem 0;
  text-align: center;
  padding: 2rem;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 0.8rem;
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
</style>