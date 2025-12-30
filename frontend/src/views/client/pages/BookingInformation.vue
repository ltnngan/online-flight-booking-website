<template>
    <div class="flight-selection-page">
        <AppHeader />
        <div class="flight-selection-content">
            <div class="selected-outbound">
                <div class="outbound-info">
                    <p><strong>{{ outboundFlight.fromCity }} đến {{ outboundFlight.toCity }}</strong> - {{ formatDate(outboundFlight.date) }}</p>
                    <p>{{ outboundFlight.flightCode }} - {{ outboundFlight.seatType }} - {{ formatPrice(outboundFlight.price) }} VND</p>
                </div>
                <div class="divider"></div>
                <div class="flight-schedule">
                    <div class="departure-details">
                        <p class="time">{{ outboundFlight.time }}</p>
                        <p class="city">{{ outboundFlight.fromCity }}</p>
                    </div>
                    <div class="flight-duration">
                        <p>✈ Bay thẳng - {{ outboundFlight.duration }}</p>
                        <div class="duration-extra"></div>
                    </div>
                    <div class="arrival-details">
                        <p class="time">{{ calculateArrivalTime(outboundFlight.time, outboundFlight.duration) }}</p>
                        <p class="city">{{ outboundFlight.toCity }}</p>
                    </div>
                </div>
            </div>

            <div v-if="bookingInfo.return" class="selected-return">
                <div class="return-info">
                    <p><strong>{{ returnFlight.fromCity }} đến {{ returnFlight.toCity }}</strong> - {{ formatDate(returnFlight.date) }}</p>
                    <p>{{ returnFlight.flightCode }} - {{ returnFlight.seatType }} - {{ formatPrice(returnFlight.price) }} VND</p>
                </div>
                <div class="divider"></div>
                <div class="flight-schedule">
                    <div class="departure-details">
                        <p class="time">{{ returnFlight.time }}</p>
                        <p class="city">{{ returnFlight.fromCity }}</p>
                    </div>
                    <div class="flight-duration">
                        <p>✈ Bay thẳng - {{ returnFlight.duration }}</p>
                        <div class="duration-extra"></div>
                    </div>
                    <div class="arrival-details">
                        <p class="time">{{ calculateArrivalTime(returnFlight.time, returnFlight.duration) }}</p>
                        <p class="city">{{ returnFlight.toCity }}</p>
                    </div>
                </div>
            </div>
            <div class="total-price">
                <h3>Tổng cộng</h3>
                <p style="font-size: 1.8rem;">Hành khách: {{ searchParams.adults + searchParams.children }} người</p>
                <p>Giá tiền: {{ calculateTotalPrice() }} VND</p>
            </div>
        </div>

        <div class="booking-form">
            <div class="passenger-info">
                <div 
                    v-for="(passenger, index) in localPassengerDetails" 
                    :key="index" 
                    class="passenger-form"
                >
                    <div class="passenger-title">
                        <h4 v-if="passenger.type === 'adult'">NGƯỜI LỚN ( {{ adultCount(index) }} )</h4>
                        <h4 v-else>TRẺ EM ( {{ childCount(index) }} )</h4>
                    </div>

                    <div class="passenger-fields">
                        <div class="form-group">
                            <label>Họ và tên *</label>
                            <input 
                                v-model="passenger.name" 
                                required 
                                placeholder="Nhập họ và tên" 
                                @blur="markTouched('passenger', 'name', index)"
                                :class="{'error-input': errors.passengers[index]?.name && touched.passengers[index]?.name}"
                            />
                            <p v-if="errors.passengers[index]?.name && touched.passengers[index]?.name" class="error-message">
                                {{ errors.passengers[index].name }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Ngày sinh *</label>
                            <input 
                                type="date" 
                                v-model="passenger.dob" 
                                required 
                                @blur="markTouched('passenger', 'dob', index)"
                                :class="{'error-input': errors.passengers[index]?.dob && touched.passengers[index]?.dob}"
                            />
                            <p v-if="errors.passengers[index]?.dob && touched.passengers[index]?.dob" class="error-message">
                                {{ errors.passengers[index].dob }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Giới tính *</label>
                            <select 
                                v-model="passenger.gender" 
                                required
                                @blur="markTouched('passenger', 'gender', index)"
                                :class="{'error-input': errors.passengers[index]?.gender && touched.passengers[index]?.gender}"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                            <p v-if="errors.passengers[index]?.gender && touched.passengers[index]?.gender" class="error-message">
                                {{ errors.passengers[index].gender }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="contact-info">
                <div class="contact-info-header">
                    <h3>Thông tin liên hệ</h3>
                </div>
                <div class="contact-info-fields">
                    <div class="form-group">
                        <label>Name *</label>
                        <input 
                            v-model="localContactInfo.name" 
                            type="text" 
                            required 
                            placeholder="Nhập name" 
                            @blur="markTouched('contact', 'name')"
                            :class="{'error-input': errors.contactInfo.name && touched.contactInfo.name}"
                        />
                        <p v-if="errors.contactInfo.name && touched.contactInfo.name" class="error-message">
                            {{ errors.contactInfo.name }}
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Email *</label>
                        <input 
                            v-model="localContactInfo.email" 
                            type="email" 
                            required 
                            placeholder="Nhập email" 
                            @blur="markTouched('contact', 'email')"
                            :class="{'error-input': errors.contactInfo.email && touched.contactInfo.email}"
                        />
                        <p v-if="errors.contactInfo.email && touched.contactInfo.email" class="error-message">
                            {{ errors.contactInfo.email }}
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Số điện thoại *</label>
                        <input 
                            v-model="localContactInfo.phoneNumber" 
                            required 
                            placeholder="Nhập số điện thoại" 
                            @blur="markTouched('contact', 'phoneNumber')"
                            :class="{'error-input': errors.contactInfo.phoneNumber && touched.contactInfo.phoneNumber}"
                        />
                        <p v-if="errors.contactInfo.phoneNumber && touched.contactInfo.phoneNumber" class="error-message">
                            {{ errors.contactInfo.phoneNumber }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button @click="goBackToOutbound" class="back-btn">Quay lại chọn chuyến bay về</button>
            <button 
                @click="submitBooking" 
                class="continue-btn" 
                :disabled="!isFormComplete"
            >
                Xác nhận thông tin đặt chỗ
            </button>
        </div>
    </div>
</template>

<script>
import AppHeader from "../../../components/client/AppHeader.vue";
import authService from '../../../services/client/auth.service';

export default {
    components: {
        AppHeader
    },
    data() {
        return {
            bookingInfo: {},
            searchParams: {},
            flightResults: {},
            localPassengerDetails: [],
            localContactInfo: {
                name: '',
                email: '',
                phoneNumber: ''
            },
            // Thêm đối tượng errors để lưu các lỗi
            errors: {
                contactInfo: {
                    name: '',
                    email: '',
                    phoneNumber: ''
                },
                passengers: []
            },
            // Đánh dấu trường đã được chạm vào (touched)
            touched: {
                contactInfo: {
                    name: false,
                    email: false,
                    phoneNumber: false
                },
                passengers: []
            }
        };
    },
    created() {
        this.bookingInfo = JSON.parse(sessionStorage.getItem('bookingInfo') || '{}');
        this.searchParams = JSON.parse(sessionStorage.getItem('searchParams') || '{}');
        this.flightResults = JSON.parse(sessionStorage.getItem('flightResults') || '{}');

        this.restoreUserInfoFromSessionStorage();
        this.autoFillContactInfo();

        // Kiểm tra dữ liệu đầu vào
        if (!this.bookingInfo.outbound || 
            !this.searchParams.from || 
            typeof this.searchParams.from !== 'string' || 
            this.searchParams.from.trim() === '') {
            console.error('Missing required flight selection data');
            this.$router.push({ name: 'FlightSelection' });
            return;
        }
    },
    computed: {
        outboundFlight() {
            return this.bookingInfo.outbound || {};
        },
        returnFlight() {
            return this.bookingInfo.return || {};
        },
        isFormComplete() {
            const allPassengersFilled = this.localPassengerDetails.every(passenger => 
                passenger.name && 
                passenger.dob && 
                passenger.gender
            );

            const contactInfoFilled = 
                this.localContactInfo.name && 
                this.localContactInfo.email && 
                this.localContactInfo.phoneNumber;

            return allPassengersFilled && contactInfoFilled;
        }
    },
    methods: {
        restoreUserInfoFromSessionStorage() {
            const storedData = sessionStorage.getItem('bookingData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                this.localPassengerDetails = parsedData.passengers || [];
                this.localContactInfo = parsedData.contactInfo || { name: '', email: '', phoneNumber: '' };
            } else {
                this.localPassengerDetails = [
                    ...Array.from({ length: this.searchParams.adults }, () => ({ type: 'adult', name: '', dob: '', gender: '' })),
                    ...Array.from({ length: this.searchParams.children }, () => ({ type: 'child', name: '', dob: '', gender: '' }))
                ];
            }
            
            // Khởi tạo mảng lỗi và trạng thái touched cho hành khách
            this.errors.passengers = Array(this.localPassengerDetails.length).fill().map(() => ({
                name: '',
                dob: '',
                gender: ''
            }));
            
            this.touched.passengers = Array(this.localPassengerDetails.length).fill().map(() => ({
                name: false,
                dob: false,
                gender: false
            }));
        },
        autoFillContactInfo() {
            if (authService.isLoggedIn()) {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    const userData = currentUser.user || currentUser;
                    this.localContactInfo = {
                        name: userData.name || userData.fullName || '',
                        email: userData.email || '',
                        phoneNumber: userData.phoneNumber || userData.phone || ''
                    };
                }
            }
        },
        adultCount(index) {
            return this.localPassengerDetails.slice(0, index + 1).filter(p => p.type === 'adult').length;
        },
        childCount(index) {
            return this.localPassengerDetails.slice(0, index + 1).filter(p => p.type === 'child').length;
        },
        goBackToOutbound() {
            const bookingData = {
                flights: this.bookingInfo,
                passengers: this.localPassengerDetails,
                contactInfo: this.localContactInfo,
                totalPrice: this.calculateTotalPrice()
            };
            sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
            this.$router.push({ name: this.bookingInfo.return ? 'ReturnFlightSelection' : 'FlightSelection' });
        },
        calculateTotalPrice() {
            let total = Number(this.outboundFlight.price) || 0;
            if (this.returnFlight.price) {
                total += Number(this.returnFlight.price);
            }
            total *= (Number(this.searchParams.adults) + Number(this.searchParams.children));
            return total.toLocaleString('vi-VN');
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date)) return 'Ngày không hợp lệ';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        formatPrice(price) {
            if (!price) return '0';
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        calculateArrivalTime(departureTime, duration) {
            if (!departureTime || !duration) return 'N/A';

            const [depHours, depMinutes] = departureTime.split(':').map(Number);
            let totalDepMinutes = depHours * 60 + depMinutes;

            const durationMatch = duration.match(/(\d+)h(\d*)/);
            if (!durationMatch) return 'N/A';
            const durationHours = parseInt(durationMatch[1]) || 0;
            const durationMinutes = parseInt(durationMatch[2]) || 0;
            const totalDurationMinutes = durationHours * 60 + durationMinutes;

            let totalMinutes = totalDepMinutes + totalDurationMinutes;

            let arrivalHours = Math.floor(totalMinutes / 60) % 24;
            let arrivalMinutes = totalMinutes % 60;

            arrivalHours = String(arrivalHours).padStart(2, '0');
            arrivalMinutes = String(arrivalMinutes).padStart(2, '0');

            return `${arrivalHours}:${arrivalMinutes}`;
        },
        
        // Phương thức xác thực tên
        validateName(name) {
            if (!name || name.trim() === '') {
                return 'Vui lòng nhập họ và tên';
            }
            if (name.length < 2) {
                return 'Tên phải có ít nhất 2 ký tự';
            }
            if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
                return 'Tên chỉ được chứa chữ cái và khoảng trắng';
            }
            return '';
        },
        
        // Phương thức xác thực email
        validateEmail(email) {
            if (!email || email.trim() === '') {
                return 'Vui lòng nhập địa chỉ email';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return 'Địa chỉ email không hợp lệ';
            }
            return '';
        },
        
        // Phương thức xác thực số điện thoại
        validatePhoneNumber(phoneNumber) {
            if (!phoneNumber || phoneNumber.trim() === '') {
                return 'Vui lòng nhập số điện thoại';
            }
            // Kiểm tra số điện thoại Việt Nam (10 hoặc 11 số, bắt đầu bằng 0)
            const phoneRegex = /^(0[3-9][0-9]{8}|09[0-9]{8}|01[2689][0-9]{8})$/;
            if (!phoneRegex.test(phoneNumber)) {
                return 'Số điện thoại không hợp lệ (phải có 10 hoặc 11 số, bắt đầu bằng 0)';
            }
            return '';
        },
        
        // Phương thức xác thực ngày sinh
        validateDob(dob) {
            if (!dob) {
                return 'Vui lòng chọn ngày sinh';
            }
            
            const birthDate = new Date(dob);
            const today = new Date();
            
            if (isNaN(birthDate.getTime())) {
                return 'Ngày sinh không hợp lệ';
            }
            
            if (birthDate > today) {
                return 'Ngày sinh không thể là ngày trong tương lai';
            }
            
            return '';
        },
        
        // Phương thức kiểm tra tất cả thông tin liên hệ
        validateContactInfo() {
            this.errors.contactInfo.name = this.validateName(this.localContactInfo.name);
            this.errors.contactInfo.email = this.validateEmail(this.localContactInfo.email);
            this.errors.contactInfo.phoneNumber = this.validatePhoneNumber(this.localContactInfo.phoneNumber);
            
            // Trả về true nếu không có lỗi
            return !this.errors.contactInfo.name &&
                   !this.errors.contactInfo.email &&
                   !this.errors.contactInfo.phoneNumber;
        },
        
        // Phương thức kiểm tra thông tin hành khách
        validatePassengers() {
            let isValid = true;
            
            // Kiểm tra từng hành khách
            this.localPassengerDetails.forEach((passenger, index) => {
                // Xác thực tên
                this.errors.passengers[index].name = this.validateName(passenger.name);
                if (this.errors.passengers[index].name) isValid = false;
                
                // Xác thực ngày sinh
                this.errors.passengers[index].dob = this.validateDob(passenger.dob);
                if (this.errors.passengers[index].dob) isValid = false;
                
                // Xác thực giới tính
                if (!passenger.gender) {
                    this.errors.passengers[index].gender = 'Vui lòng chọn giới tính';
                    isValid = false;
                } else {
                    this.errors.passengers[index].gender = '';
                }
            });
            
            return isValid;
        },
        
        // Phương thức đánh dấu trường đã được tương tác
        markTouched(type, field, index = null) {
            if (type === 'contact') {
                this.touched.contactInfo[field] = true;
                // Kiểm tra lại giá trị khi người dùng tương tác
                if (field === 'name') {
                    this.errors.contactInfo.name = this.validateName(this.localContactInfo.name);
                } else if (field === 'email') {
                    this.errors.contactInfo.email = this.validateEmail(this.localContactInfo.email);
                } else if (field === 'phoneNumber') {
                    this.errors.contactInfo.phoneNumber = this.validatePhoneNumber(this.localContactInfo.phoneNumber);
                }
            } else if (type === 'passenger' && index !== null) {
                if (!this.touched.passengers[index]) {
                    this.$set(this.touched.passengers, index, { name: false, dob: false, gender: false });
                }
                this.touched.passengers[index][field] = true;
                
                // Kiểm tra lại giá trị
                if (field === 'name') {
                    this.errors.passengers[index].name = this.validateName(this.localPassengerDetails[index].name);
                } else if (field === 'dob') {
                    this.errors.passengers[index].dob = this.validateDob(this.localPassengerDetails[index].dob);
                } else if (field === 'gender') {
                    this.errors.passengers[index].gender = this.localPassengerDetails[index].gender ? '' : 'Vui lòng chọn giới tính';
                }
            }
        },
        
        // Sửa phương thức submitBooking để kiểm tra tính hợp lệ
        submitBooking() {
            // Đánh dấu tất cả các trường đã được tương tác
            this.touched.contactInfo.name = true;
            this.touched.contactInfo.email = true;
            this.touched.contactInfo.phoneNumber = true;
            
            this.localPassengerDetails.forEach((_, index) => {
                if (!this.touched.passengers[index]) {
                    this.$set(this.touched.passengers, index, { name: true, dob: true, gender: true });
                } else {
                    this.touched.passengers[index].name = true;
                    this.touched.passengers[index].dob = true;
                    this.touched.passengers[index].gender = true;
                }
            });
            
            // Xác thực tất cả dữ liệu
            const contactValid = this.validateContactInfo();
            const passengersValid = this.validatePassengers();
            
            if (contactValid && passengersValid) {
                const bookingData = {
                    flights: this.bookingInfo,
                    passengers: this.localPassengerDetails,
                    contactInfo: this.localContactInfo,
                    totalPrice: this.calculateTotalPrice()
                };
                sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
                this.$router.push({ name: 'BookingConfirmation' });
            } else {
                // Cuộn đến phần tử lỗi đầu tiên
                this.$nextTick(() => {
                    const errorEl = document.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }
        }
    }
};
</script>

<style scoped>
.flight-selection-page {
    width: 100%;
    background-color: #f5f7fa;
}   

.selected-outbound,
.selected-return {
    background-color: #ffffff;
    padding: 2rem;
    margin: 2rem 17%;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 .2rem .8rem rgba(0, 0, 0, 0.1);
}

.total-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    padding: 2rem;
    margin: 2rem 17%;
    font-size: 2.5rem;
}

.outbound-info,
.return-info {
    display: flex;
    justify-content: space-between;
    font-size: 1.6rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.divider {
    width: 100%;
    height: 0.1rem;
    background-color: #374151;
}

.flight-schedule {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 2rem;
    gap: 1rem;
}

.departure-details,
.arrival-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 100px;
}

.flight-duration {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #003366;
    flex: 1;
}

.time {
    font-size: 1.8rem;
    font-weight: 500;
}

.city {
    color: #003366;
    font-size: 1.4rem;
}

.duration-extra {
    width: 100%;
    border-bottom: 0.2rem dotted #374151;
}

.booking-form {
    padding: 2rem 17%;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    margin-bottom: 8.25rem;
}

.passenger-info {
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

.passenger-form, .contact-info {
    background-color: #ffffff;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.passenger-title, .contact-info-header {
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: center;
    /* background-color: #ffc107; */
    font-size: 1.8rem;
    color: #ffc107;
    margin-top: 2rem;
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
}

.passenger-fields, .contact-info-fields {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 2rem 5rem 2rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group input, .contact-info input, .form-group select {
    padding: 1.75rem;
    border-radius: .5rem;
    border: .2rem solid #ccc;
}

.button-group {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between; 
    align-items: center;
    padding: 2rem 16rem;
    background-color: #ffffff;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); 
    z-index: 1000; 
}

.back-btn, .continue-btn {
    padding: 1.25rem 2rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.back-btn {
    background-color: #ccc;
    color: #333;
}

.back-btn:hover {
    background-color: #bbb;
}

.continue-btn {
    background-color: #ff4d4f;
    color: #fff;
}

.continue-btn:hover {
    background-color: #e60000;
}

.continue-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* CSS cho phần xác thực form */
.error-message {
    color: #ff4d4f;
    font-size: 1.2rem;
    margin-top: 0.5rem;
}

.error-input {
    border: 0.2rem solid #ff4d4f !important;
    background-color: #fff1f0;
}
</style>