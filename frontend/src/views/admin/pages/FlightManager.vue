<template>
  <div class="flight-admin">
    <!-- Form tạo chuyến bay -->
    <section class="create-flight">
      <h2>Tạo Chuyến Bay Mới</h2>
      <form @submit.prevent="handleCreateFlight">
        <div class="form-group">
          <label for="fromCity">Thành Phố Đi</label>
          <select id="fromCity" v-model="flightForm.fromCity" @change="updateToCities('flight')" required>
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
            <option v-for="city in availableToCities.flight" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <p v-if="!availableToCities.flight.length && flightForm.fromCity" class="error">
            Không có thành phố đến khả dụng cho {{ flightForm.fromCity }}.
          </p>
        </div>
        <div class="form-group">
          <label for="date">Ngày Bay</label>
          <input id="date" type="date" v-model="flightForm.date" required />
        </div>
        <div class="form-group">
          <label for="time">Giờ Bay</label>
          <input id="time" type="time" v-model="flightForm.time" required />
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
            <select v-model="seat.category" required>
              <option value="" disabled>Chọn hạng ghế</option>
              <option v-for="category in seatCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <input
              type="number"
              v-model="seat.available"
              placeholder="Số ghế khả dụng"
              min="0"
              required
            />
            <input
              type="number"
              v-model="seat.total"
              placeholder="Tổng số ghế"
              min="0"
              required
            />
            <input
              type="number"
              v-model="seat.priceMultiplier"
              placeholder="Hệ số giá"
              min="0.1"
              step="0.1"
              required
            />
            <button type="button" @click="removeSeat(index, 'flight')" class="remove-seat">
              Xóa
            </button>
          </div>
          <button type="button" @click="addSeat('flight')" class="add-seat">Thêm Ghế</button>
        </div>
        <div class="form-group">
          <label for="image">Hình Ảnh</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            @change="handleFlightImageChange"
          />
          <div v-if="flightImagePreview" class="image-preview">
            <img :src="flightImagePreview" alt="Xem trước" />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="isCreating">Tạo Chuyến Bay</button>
          <button type="button" @click="resetFlightForm">Đặt Lại</button>
        </div>
        <p v-if="createSuccessMessage" class="success">{{ createSuccessMessage }}</p>
        <p v-if="createErrorMessage" class="error">{{ createErrorMessage }}</p>
      </form>
    </section>

    <!-- Danh sách chuyến bay -->
    <section class="flight-list">
      <h2>Danh Sách Chuyến Bay</h2>
      <div v-if="isLoading" class="loading">Đang tải...</div>
      <div v-else-if="flights.length" class="flight-table">
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
            <tr v-for="flight in flights" :key="flight._id">
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
                <button @click="openEditModal(flight)" class="edit-btn">Sửa</button>
                <button
                  @click="deleteFlight(flight._id)"
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
      <p v-else>Không có chuyến bay nào.</p>
    </section>

    <!-- Modal chỉnh sửa chuyến bay -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Chỉnh Sửa Chuyến Bay</h3>
        <form @submit.prevent="handleEditFlight">
          <div class="form-group">
            <label for="editFlightCode">Mã Chuyến Bay</label>
            <input
              id="editFlightCode"
              v-model="editForm.flightCode"
              placeholder="Mã chuyến bay"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="editFromCity">Thành Phố Đi</label>
            <select id="editFromCity" v-model="editForm.fromCity" @change="updateToCities('edit')" required>
              <option value="" disabled>Chọn thành phố</option>
              <option v-for="route in flightRoutes" :key="route._id" :value="route.fromCity">
                {{ route.fromCity }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="editToCity">Thành Phố Đến</label>
            <select id="editToCity" v-model="editForm.toCity" required>
              <option value="" disabled>Chọn thành phố</option>
              <option v-for="city in availableToCities.edit" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
            <p v-if="!availableToCities.edit.length && editForm.fromCity" class="error">
              Không có thành phố đến khả dụng cho {{ editForm.fromCity }}.
            </p>
          </div>
          <div class="form-group">
            <label for="editDate">Ngày Bay</label>
            <input id="editDate" type="date" v-model="editForm.date" required />
          </div>
          <div class="form-group">
            <label for="editTime">Giờ Bay</label>
            <input id="editTime" type="time" v-model="editForm.time" required />
          </div>
          <div class="form-group">
            <label for="editDuration">Thời Gian Bay (phút)</label>
            <input
              id="editDuration"
              type="number"
              v-model="editForm.duration"
              placeholder="Nhập thời gian"
              min="1"
              required
            />
          </div>
          <div class="form-group">
            <label for="editAircraft">Máy Bay</label>
            <select id="editAircraft" v-model="editForm.aircraft" required>
              <option value="" disabled>Chọn máy bay</option>
              <option v-for="aircraft in aircrafts" :key="aircraft" :value="aircraft">
                {{ aircraft }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="editBasePrice">Giá Cơ Bản</label>
            <input
              id="editBasePrice"
              type="number"
              v-model="editForm.basePrice"
              placeholder="Nhập giá cơ bản"
              min="0"
              required
            />
          </div>
          <div class="form-group">
            <label>Ghế Ngồi</label>
            <div v-for="(seat, index) in editForm.seats" :key="index" class="seat-group">
              <select v-model="seat.category" required>
                <option value="" disabled>Chọn hạng ghế</option>
                <option v-for="category in seatCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
              <input
                type="number"
                v-model="seat.available"
                placeholder="Số ghế khả dụng"
                min="0"
                required
              />
              <input
                type="number"
                v-model="seat.total"
                placeholder="Tổng số ghế"
                min="0"
                required
              />
              <input
                type="number"
                v-model="seat.priceMultiplier"
                placeholder="Hệ số giá"
                min="0.1"
                step="0.1"
                required
              />
              <button type="button" @click="removeSeat(index, 'edit')" class="remove-seat">
                Xóa
              </button>
            </div>
            <button type="button" @click="addSeat('edit')" class="add-seat">Thêm Ghế</button>
          </div>
          <div class="form-group">
            <label for="editImage">Hình Ảnh</label>
            <input
              id="editImage"
              type="file"
              accept="image/*"
              @change="handleEditImageChange"
            />
            <div v-if="editImagePreview" class="image-preview">
              <img :src="editImagePreview" alt="Xem trước" />
            </div>
            <div v-else-if="editForm.image" class="image-preview">
              <img :src="getImageUrl(editForm.image)" alt="Hình ảnh hiện tại" />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="isEditing">Lưu</button>
            <button type="button" @click="closeEditModal">Hủy</button>
          </div>
          <p v-if="editSuccessMessage" class="success">{{ editSuccessMessage }}</p>
          <p v-if="editErrorMessage" class="error">{{ editErrorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllFlights, createFlight, editFlight, deleteFlight } from '../../../services/admin/flight.service';
import { getAllFlightRoutes } from '../../../services/admin/flight-route.service';

export default {
  name: 'FlightAdmin',
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
      flightImagePreview: null,
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
      editImage: null,
      editImagePreview: null,
      flights: [],
      flightRoutes: [],
      availableToCities: {
        flight: [],
        edit: [],
      },
      isLoading: false,
      isCreating: false,
      isEditing: false,
      isDeleting: false,
      showEditModal: false,
      createSuccessMessage: '',
      createErrorMessage: '',
      editSuccessMessage: '',
      editErrorMessage: '',
      aircrafts: ['Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 787', 'ATR 72'],
      seatCategories: ['Economy', 'Deluxe', 'SkyBoss'],
    };
  },
  created() {
    this.fetchFlights();
    this.fetchFlightRoutes();
  },
  methods: {
    async fetchFlights() {
      this.isLoading = true;
      this.createErrorMessage = '';
      try {
        const response = await getAllFlights();
        this.flights = response.data.data || [];
      } catch (error) {
        this.createErrorMessage = error.response?.data?.message || 'Không thể tải danh sách chuyến bay.';
      } finally {
        this.isLoading = false;
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
          this.createErrorMessage = 'Dữ liệu tuyến bay không hợp lệ.';
        }
      } catch (error) {
        this.createErrorMessage = error.response?.data?.message || 'Không thể tải danh sách tuyến bay.';
      }
    },
    updateToCities(formType) {
      const fromCity = formType === 'flight' ? this.flightForm.fromCity : this.editForm.fromCity;
      console.log('Selected fromCity:', fromCity);

      const route = this.flightRoutes.find(r => r.fromCity === fromCity);
      console.log('Found route:', route);

      if (route && route.toCity) {
        this.availableToCities[formType] = Array.isArray(route.toCity)
          ? [...route.toCity]
          : [route.toCity];
      } else {
        this.availableToCities[formType] = [];
        console.warn(`No valid toCity found for ${fromCity}`);
      }

      console.log(`Available toCities for ${formType}:`, this.availableToCities[formType]);

      if (formType === 'flight' && !this.availableToCities.flight.includes(this.flightForm.toCity)) {
        this.flightForm.toCity = '';
      } else if (formType === 'edit' && !this.availableToCities.edit.includes(this.editForm.toCity)) {
        this.editForm.toCity = '';
      }
    },
    async handleCreateFlight() {
      if (!this.flightForm.seats.length || this.flightForm.seats.some(seat => !seat.category)) {
        this.createErrorMessage = 'Vui lòng thêm ít nhất một ghế hợp lệ với danh mục.';
        return;
      }
      if (this.flightForm.seats.some(seat => seat.available > seat.total || seat.available < 0 || seat.total < 0)) {
        this.createErrorMessage = 'Số ghế khả dụng không được vượt quá tổng số ghế và không được âm.';
        return;
      }
      if (this.flightForm.seats.some(seat => seat.priceMultiplier <= 0)) {
        this.createErrorMessage = 'Hệ số giá phải lớn hơn 0.';
        return;
      }
      if (!this.flightForm.fromCity || !this.flightForm.toCity || !this.flightForm.date ||
          !this.flightForm.time || !this.flightForm.duration || !this.flightForm.aircraft ||
          !this.flightForm.basePrice) {
        this.createErrorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc.';
        return;
      }
      if (this.flightForm.fromCity === this.flightForm.toCity) {
        this.createErrorMessage = 'Thành phố đi và đến phải khác nhau.';
        return;
      }
      if (this.flightForm.basePrice < 0 || this.flightForm.duration < 1) {
        this.createErrorMessage = 'Giá cơ bản không được âm và thời gian bay phải lớn hơn 0.';
        return;
      }
      this.isCreating = true;
      this.createSuccessMessage = '';
      this.createErrorMessage = '';
      try {
        const flightData = {
          fromCity: this.flightForm.fromCity,
          toCity: this.flightForm.toCity,
          date: this.flightForm.date,
          time: this.flightForm.time,
          duration: Number(this.flightForm.duration),
          aircraft: this.flightForm.aircraft,
          basePrice: Number(this.flightForm.basePrice),
          seats: this.flightForm.seats.map(seat => ({
            category: seat.category,
            available: Number(seat.available),
            total: Number(seat.total),
            priceMultiplier: Number(seat.priceMultiplier),
          })),
        };
        const response = await createFlight(flightData, this.flightImage);
        this.createSuccessMessage = response.data.message;
        this.resetFlightForm();
        await this.fetchFlights();
      } catch (error) {
        this.createErrorMessage =
          error.response?.data?.message || 'Không thể tạo chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isCreating = false;
      }
    },
    async openEditModal(flight) {
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
      this.updateToCities('edit');
      this.editImage = null;
      this.editImagePreview = null;
      this.showEditModal = true;
    },
    async handleEditFlight() {
      if (!this.editForm.seats.length || this.editForm.seats.some(seat => !seat.category)) {
        this.editErrorMessage = 'Vui lòng thêm ít nhất một ghế hợp lệ với danh mục.';
        return;
      }
      if (this.editForm.seats.some(seat => seat.available > seat.total || seat.available < 0 || seat.total < 0)) {
        this.editErrorMessage = 'Số ghế khả dụng không được vượt quá tổng số ghế và không được âm.';
        return;
      }
      if (this.editForm.seats.some(seat => seat.priceMultiplier <= 0)) {
        this.editErrorMessage = 'Hệ số giá phải lớn hơn 0.';
        return;
      }
      if (!this.editForm.fromCity || !this.editForm.toCity || !this.editForm.date ||
          !this.editForm.time || !this.editForm.duration || !this.editForm.aircraft ||
          !this.editForm.basePrice) {
        this.editErrorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc.';
        return;
      }
      if (this.editForm.fromCity === this.editForm.toCity) {
        this.editErrorMessage = 'Thành phố đi và đến phải khác nhau.';
        return;
      }
      if (this.editForm.basePrice < 0 || this.editForm.duration < 1) {
        this.editErrorMessage = 'Giá cơ bản không được âm và thời gian bay phải lớn hơn 0.';
        return;
      }
      this.isEditing = true;
      this.editSuccessMessage = '';
      this.editErrorMessage = '';
      try {
        const flightData = {
          fromCity: this.editForm.fromCity,
          toCity: this.editForm.toCity,
          date: this.editForm.date,
          time: this.editForm.time,
          duration: Number(this.editForm.duration),
          aircraft: this.editForm.aircraft,
          basePrice: Number(this.editForm.basePrice),
          seats: this.editForm.seats.map(seat => ({
            category: seat.category,
            available: Number(seat.available),
            total: Number(seat.total),
            priceMultiplier: Number(seat.priceMultiplier),
          })),
        };
        const response = await editFlight(this.editForm.id, flightData, this.editImage);
        this.editSuccessMessage = response.data.message;
        this.closeEditModal();
        await this.fetchFlights();
      } catch (error) {
        this.editErrorMessage =
          error.response?.data?.message || 'Không thể cập nhật chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isEditing = false;
      }
    },
    async deleteFlight(flightId) {
      if (!confirm('Bạn có chắc muốn xóa chuyến bay này?')) return;
      this.isDeleting = true;
      this.createErrorMessage = '';
      try {
        const response = await deleteFlight(flightId);
        this.createSuccessMessage = response.data.message;
        await this.fetchFlights();
      } catch (error) {
        this.createErrorMessage =
          error.response?.data?.message || 'Không thể xóa chuyến bay. Vui lòng thử lại.';
      } finally {
        this.isDeleting = false;
      }
    },
    handleFlightImageChange(event) {
      const file = event.target.files[0];
      this.flightImage = file;
      this.flightImagePreview = file ? URL.createObjectURL(file) : null;
    },
    handleEditImageChange(event) {
      const file = event.target.files[0];
      this.editImage = file;
      this.editImagePreview = file ? URL.createObjectURL(file) : null;
    },
    addSeat(formType) {
      const newSeat = { category: '', available: 0, total: 0, priceMultiplier: 1 };
      if (formType === 'flight') {
        this.flightForm.seats.push(newSeat);
      } else if (formType === 'edit') {
        this.editForm.seats.push(newSeat);
      }
    },
    removeSeat(index, formType) {
      if (formType === 'flight') {
        this.flightForm.seats.splice(index, 1);
      } else if (formType === 'edit') {
        this.editForm.seats.splice(index, 1);
      }
    },
    resetFlightForm() {
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
      this.flightImagePreview = null;
      this.createSuccessMessage = '';
      this.createErrorMessage = '';
      this.availableToCities.flight = [];
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editForm = {
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
      };
      this.editImage = null;
      this.editImagePreview = null;
      this.editSuccessMessage = '';
      this.editErrorMessage = '';
      this.availableToCities.edit = [];
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
  },
};
</script>

<style scoped>
.flight-admin {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.create-flight,
.flight-list {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

input[readonly] {
  background: #f1f1f1;
  cursor: not-allowed;
}

.seat-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.seat-group select,
.seat-group input {
  flex: 1;
}

.add-seat,
.remove-seat {
  padding: 0.3rem 0.6rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-seat {
  background: #dc3545;
}

.add-seat:hover {
  background: #0056b3;
}

.remove-seat:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

button[type="submit"] {
  background: #28a745;
}

button[type="submit"]:hover {
  background: #218838;
}

button[type="submit"]:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

button[type="button"] {
  background: #6c757d;
}

button[type="button"]:hover {
  background: #5a6268;
}

.edit-btn {
  background: #007bff;
  margin-right: 0.5rem;
}

.edit-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #555;
}

.flight-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f1f1f1;
  font-weight: bold;
}

td ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

td li {
  margin-bottom: 0.5rem;
}

.flight-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.image-preview {
  margin-top: 0.5rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

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
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
}

.success {
  color: #28a745;
  margin-top: 1rem;
  text-align: center;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
}
</style>