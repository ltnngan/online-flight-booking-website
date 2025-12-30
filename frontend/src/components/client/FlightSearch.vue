<template>
    <div class="flight-search-wrapper">
        <div class="flight-search">
            <div class="color-box">
                <i class="fa-solid fa-plane"></i>
                MUA VÉ
            </div>
            <form @submit.prevent="handleSearch" class="from-input">
                <div class="trip-type">
                    <label>
                        <input type="radio" v-model="searchParams.tripType" value="roundtrip" required>
                        Khứ hồi
                    </label>
                    <label>
                        <input type="radio" v-model="searchParams.tripType" value="oneway" required>
                        Một chiều
                    </label>
                </div>
                <div class="search-fields">
                    <div class="field">
                        <label>Từ:</label>
                        <input 
                            v-model="searchParams.from" 
                            @focus="handleFocus('from')" 
                            @input="filterProvinces('from')" 
                            required 
                            placeholder="Nhập hoặc chọn điểm khởi hành"
                        >
                        <transition name="fade-slide">
                            <div class="dropdown" v-if="showFromDropdown">
                                <ul>
                                    <li v-for="province in filteredFromProvinces" :key="province">
                                        <div @click="selectProvince('from', province)">
                                            {{ province }}
                                        </div>
                                        <hr class="divider" />
                                    </li>
                                </ul>
                            </div>
                        </transition>
                    </div>
                    <div class="field">
                        <label>Đến:</label>
                        <input 
                            v-model="searchParams.to" 
                            @focus="handleFocus('to')"  
                            @input="filterProvinces('to')" 
                            required 
                            placeholder="Nhập hoặc chọn điểm đến"
                        >
                        <transition name="fade-slide">
                            <div class="dropdown" v-if="showToDropdown">
                                <ul>
                                    <li v-for="province in filteredToProvinces" :key="province">
                                        <div @click="selectProvince('to', province)">
                                            {{ province }}
                                        </div>
                                        <hr class="divider" />
                                    </li>
                                </ul>
                            </div>
                        </transition>
                    </div>
                    <div class="field">
                        <label>Ngày đi:</label>
                        <input v-model="searchParams.date" ref="departureDate" required placeholder="Chọn thời gian khởi hành">
                    </div>
                    <div v-if="searchParams.tripType === 'roundtrip'" class="field">
                        <label>Ngày đến:</label>
                        <input v-model="searchParams.returnDate" ref="returnDate" required placeholder="Chọn thời gian đến">
                    </div>
                </div>

                <div class="passenger-select">
                    <label>Hành khách:</label>
                    <div class="passenger-input" @click="togglePassengerDropdown" ref="passengerInput">
                        {{passengerSummary}}
                        <i class="fa-solid fa-caret-down dropdown-icon"></i>
                    </div>

                    <transition name="fade-slide">
                        <div v-if="showPassenger" class="passenger-dropdown" ref="passengerDropdown">
                            <div class="passenger-option">
                                <label>Người lớn (12 tuổi trở lên):</label>
                                <div class="counter">
                                    <button type="button" @click="updatePassenger('adults', -1)" :disabled="searchParams.adults <= 1">-</button>
                                    <span>{{ searchParams.adults }}</span>
                                    <button type="button" @click="updatePassenger('adults', 1)">+</button>
                                </div>
                            </div>
                            <div class="passenger-option">
                                <label>Trẻ em (2-11 tuổi):</label>
                                <div class="counter">
                                    <button type="button" @click="updatePassenger('children', -1)" :disabled="searchParams.children <= 0">-</button>
                                    <span>{{ searchParams.children }}</span>
                                    <button type="button" @click="updatePassenger('children', 1)">+</button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <div class="search-button-wrapper">
                    <button type="submit" class="search-button">Tìm kiếm chuyến bay</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import flightAPI from '../../services/client/flight.service'
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default {
    name: 'FlightSearch',
    props: {
        presetSearch: Object
    },
    data() {
        return {
            searchParams: {
                tripType: 'roundtrip',
                from: '',
                to: '',
                date: '',
                returnDate: '',
                adults: 1,
                children: 0
            },
            showPassenger: false,
            departurePicker: null,
            returnPicker: null,
            provinces: [
                'An Giang',
                'Bà Rịa - Vũng Tàu',
                'Bạc Liêu',
                'Bắc Giang',
                'Bắc Kạn',
                'Bắc Ninh',
                'Bến Tre',
                'Bình Dương',
                'Bình Định',
                'Bình Phước',
                'Bình Thuận',
                'Cà Mau',
                'Cao Bằng',
                'Cần Thơ',
                'Đà Nẵng',
                'Đắk Lắk',
                'Đắk Nông',
                'Điện Biên',
                'Đồng Nai',
                'Đồng Tháp',
                'Gia Lai',
                'Hà Giang',
                'Hà Nam',
                'Hà Nội',
                'Hà Tĩnh',
                'Hải Dương',
                'Hải Phòng',
                'Hậu Giang',
                'Hòa Bình',
                'Hồ Chí Minh',
                'Hưng Yên',
                'Khánh Hòa',
                'Kiên Giang',
                'Kon Tum',
                'Lai Châu',
                'Lạng Sơn',
                'Lào Cai',
                'Lâm Đồng',
                'Long An',
                'Nam Định',
                'Nghệ An',
                'Ninh Bình',
                'Ninh Thuận',
                'Phú Thọ',
                'Phú Yên',
                'Quảng Bình',
                'Quảng Nam',
                'Quảng Ngãi',
                'Quảng Ninh',
                'Quảng Trị',
                'Sóc Trăng',
                'Sơn La',
                'Tây Ninh',
                'Thái Bình',
                'Thái Nguyên',
                'Thanh Hóa',
                'Thừa Thiên Huế',
                'Tiền Giang',
                'Trà Vinh',
                'Tuyên Quang',
                'Vĩnh Long',
                'Vĩnh Phúc',
                'Yên Bái'
            ],
            showFromDropdown: false,
            showToDropdown: false,
            filteredFromProvinces: [],
            filteredToProvinces: []
        }
    },
    computed: {
        passengerSummary() {
            const adults = this.searchParams.adults || 0;
            const children = this.searchParams.children || 0;
            
            let summary = `${adults} người lớn`;
            if (children > 0) summary += `, ${children} trẻ em`;
            
            return summary;
        }
    },
    mounted() {
        if (this.presetSearch) {
            this.searchParams = {
                ...this.searchParams,
                ...this.presetSearch
            };
        }

        document.addEventListener('click', this.handleClickOutside)

        this.initDeparturePicker();
        this.filteredFromProvinces = [...this.provinces];
        this.filteredToProvinces = [...this.provinces];

        if (this.searchParams.tripType === 'roundtrip') {
            this.$nextTick(() => {
                this.initReturnPicker();
            });
        }
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside)

        if (this.departurePicker) this.departurePicker.destroy();
        if (this.returnPicker) this.returnPicker.destroy();
    },
    watch: {
        'searchParams.tripType'(newVal) {
            if (newVal === 'oneway') {
                this.searchParams.returnDate = '';
                if (this.returnPicker) {
                    this.returnPicker.destroy();
                    this.returnPicker = null;
                }
            } else if (newVal === 'roundtrip') {
                this.$nextTick(() => {
                    this.initReturnPicker();
                });
            }
        },
        'searchParams.date'(newDate) {
            if (this.returnPicker) {
                this.returnPicker.set('minDate', newDate || 'today');
            }
        }
    },
    methods: {
        handleClickOutside(event) {
            const dropdown = this.$refs.passengerDropdown
            const button = this.$refs.passengerInput

            if (
                dropdown &&
                !dropdown.contains(event.target) &&
                button &&
                !button.contains(event.target)
            ) {
                this.showPassenger = false
            }

            const isField = event.target.closest('.field');
            const isDateInput = this.$refs.departureDate?.contains(event.target) || this.$refs.returnDate?.contains(event.target);

            if (!isField || isDateInput) {
                this.showFromDropdown = false;
                this.showToDropdown = false;
            }
        },
        filterProvinces(type) {
            const input = type === 'from' ? this.searchParams.from : this.searchParams.to;
            const filtered = this.provinces.filter(province =>
                province.toLowerCase().includes(input.toLowerCase())
            );
            if (type === 'from') {
                this.filteredFromProvinces = filtered.length ? filtered : [...this.provinces];
                this.showFromDropdown = true;
            } else {
                this.filteredToProvinces = filtered.length ? filtered : [...this.provinces];
                this.showToDropdown = true;
            }
        },
        selectProvince(type, province) {
            if (type === 'from') {
                this.searchParams.from = province;
                this.showFromDropdown = false;
            } else {
                this.searchParams.to = province;
                this.showToDropdown = false;
            }
        },
        handleFocus(type) {
            if (type === 'from') {
                this.showFromDropdown = true;
                this.showToDropdown = false;
            } else {
                this.showToDropdown = true;
                this.showFromDropdown = false;
            }
        },
        initDeparturePicker() {
            const self = this;
            this.departurePicker = flatpickr(this.$refs.departureDate, {
                dateFormat: 'Y-m-d',
                minDate: 'today',
                onOpen: function () {
                    self.showFromDropdown = false;
                    self.showToDropdown = false;
                },
                onReady: function () {
                    this.jumpToDate(new Date());
                },
                static: true
            });
        },
        initReturnPicker() {
            if (this.$refs.returnDate && !this.returnPicker) {
                const self = this;
                this.returnPicker = flatpickr(this.$refs.returnDate, {
                    dateFormat: 'Y-m-d',
                    minDate: this.searchParams.date || 'today',
                    onOpen: function () {
                        self.showFromDropdown = false;
                        self.showToDropdown = false;
                    },
                    onReady: function () {
                        this.jumpToDate(new Date());
                    },
                    static: true
                });
            }
        },
        togglePassengerDropdown() {
            this.showPassenger = !this.showPassenger;
        },
        updatePassenger(type, change) {
            const newValue = this.searchParams[type] + change;
            
            if (type === 'adults' && newValue < 1) return;
            if ((type === 'children' || type === 'infants') && newValue < 0) return;
            
            this.searchParams[type] = newValue;
        },
        async handleSearch() {
            try {
                const response = await flightAPI.searchFlights(this.searchParams)
                const results = response.data

                sessionStorage.setItem('searchParams', JSON.stringify(this.searchParams))
                sessionStorage.setItem('flightResults', JSON.stringify(results));
                
                this.$router.push({ name: 'FlightSelection' });
            } catch (error) {
                console.error('Đã xảy ra lỗi khi tìm kiếm chuyến bay', error);
            } 
        }
    }
}
</script>

<style scoped>
.flight-search-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
}

.flight-search {
    width: 100%;
    max-width: 90rem;
    height: auto;
    box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.1);
    transition: height 0.3s ease;
}

.color-box {
    height: 4.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: bold;
    color: #374151;
    background-color: #ffc107;
}

.color-box i {
    font-size: 1.8rem;
    color: #374151;
}

.from-input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
    background-color: #fffdf6;
}

.trip-type {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.trip-type input[type="radio"]:checked {
    accent-color: #ff4d4f;
}

.search-fields {
    display: flex;
    flex-wrap: nowrap;
    gap: 2rem;
}

.field {
    flex: 1 1 auto;
    min-width: 15rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    position: relative;
}

.field input {
    width: 100%;
    padding: 0.8rem;
    border: 0.1rem solid #cccccc;
    border-radius: 0.4rem;
    box-sizing: border-box;
    font-size: 1.2rem;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.15rem;
    padding: 0.5rem;
    background: #ffffff;
    border: 0.1rem solid #e6e6e6;
    border-radius: 0.4rem;
    box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);
    max-height: 20rem;
    overflow-y: auto;
    z-index: 1000;
}

.fade-slide-enter-active {
    transition: all 0.25s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-5px);
}

.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-slide-leave-active {
    transition: none !important;
}

.fade-slide-leave-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}

.dropdown ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.divider {
    margin: 0.5rem 0;
    border: none;
    border-top: 1px solid #eee;
}

.dropdown li {
    cursor: pointer;
    padding: 0.5rem;
}

.passenger-select {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    position: relative;
    margin-top: 1rem;
}

.passenger-input {
    width: 20rem;
    padding: 0.8rem;
    border: 0.1rem solid #cccccc;
    border-radius: 0.4rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
}

.passenger-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.15rem;
    padding: 1rem;
    background: #ffffff;
    border: 0.1rem solid #e6e6e6;
    border-radius: 0.4rem;
    box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);
    width: 31rem;
    z-index: 1000;
}

.passenger-option {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.counter {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.counter button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.counter button:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.search-button-wrapper {
    display: flex;
    justify-content: flex-end;
}

.search-button {
    padding: 0.8rem;
    font-size: 1.4rem;
    border: none;
    color: #374151;
    background-color: #ffc107;
    cursor: pointer;
    border-radius: 0.4rem;
    width: 20rem;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .flight-search-wrapper {
        padding: 2rem;
    }

    .flight-search {
        max-width: 100%;
    }

    .from-input {
        padding: 1.5rem;
        gap: 1rem;
    }

    .search-fields {
        flex-wrap: wrap;
        gap: 1rem;
    }

    .field {
        flex: 1 1 45%;
        min-width: 12rem;
    }

    .field input {
        padding: 0.7rem;
        font-size: 1.1rem;
    }

    .color-box {
        height: 4rem;
        font-size: 1.4rem;
    }

    .color-box i {
        font-size: 1.6rem;
    }

    .trip-type {
        gap: 1.5rem;
    }

    .passenger-input {
        width: 100%;
        max-width: 18rem;
        padding: 0.7rem;
        font-size: 1.1rem;
    }

    .passenger-dropdown {
        width: 100%;
        max-width: 28rem;
    }

    .search-button {
        width: 100%;
        max-width: 18rem;
        padding: 0.7rem;
        font-size: 1.2rem;
    }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
    .flight-search-wrapper {
        padding: 0.8rem;
    }

    .from-input {
        padding: 1rem;
        gap: 0.8rem;
    }

    .search-fields {
        flex-direction: column;
        gap: 0.8rem;
    }

    .field {
        flex: 1 1 100%;
        min-width: 0;
    }

    .field input {
        padding: 0.6rem;
        font-size: 1rem;
    }

    .color-box {
        height: 3.5rem;
        font-size: 1.3rem;
    }

    .color-box i {
        font-size: 1.5rem;
    }

    .trip-type {
        gap: 1rem;
    }

    .passenger-input {
        max-width: none;
        padding: 0.6rem;
        font-size: 1rem;
    }

    .passenger-dropdown {
        max-width: none;
        padding: 0.8rem;
    }

    .passenger-option {
        margin-bottom: 0.8rem;
    }

    .counter {
        gap: 0.8rem;
    }

    .counter button {
        width: 2.2rem;
        height: 2.2rem;
        font-size: 1rem;
    }

    .search-button {
        max-width: none;
        padding: 0.6rem;
        font-size: 1.1rem;
    }
}

/* Mobile (portrait): 320px - 480px */
@media (max-width: 480px) {
    .flight-search-wrapper {
        padding: 0.5rem;
    }

    .from-input {
        padding: 0.8rem;
        gap: 0.6rem;
    }

    .search-fields {
        gap: 0.6rem;
    }

    .field input {
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    .color-box {
        height: 3rem;
        font-size: 1.2rem;
    }

    .color-box i {
        font-size: 1.4rem;
    }

    .trip-type {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
    }

    .dropdown {
        padding: 0.3rem;
        max-height: 15rem;
    }

    .dropdown li {
        padding: 0.3rem;
    }

    .passenger-input {
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    .passenger-dropdown {
        padding: 0.5rem;
    }

    .passenger-option {
        margin-bottom: 0.5rem;
    }

    .counter {
        gap: 0.5rem;
    }

    .counter button {
        width: 2rem;
        height: 2rem;
        font-size: 0.9rem;
    }

    .search-button {
        padding: 0.5rem;
        font-size: 1rem;
    }
}
</style>