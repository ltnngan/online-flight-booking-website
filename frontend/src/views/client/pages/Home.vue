<template>
    <div class="home-page">
        <AppHeader />
        <div class="home-banner">
            <img src="/Banner.png" alt="" class="home-banner_image">
            <button 
                @click="scrollToFlightSearch" 
                class="buy-tickets-button pulse"
            >
                Mua Vé Ngay
            </button>
        </div>
        <div class="home-search" ref="flightSearchRef">
            <FlightSearch :preset-search="presetSearch" :key="searchKey" />
        </div>
        <div class="cheap-flights-section">
            <h2 class="section-title">GỢI Ý CHUYẾN BAY GIÁ RẺ</h2>
            <div v-if="cheapFlights.length > 0" class="cheap-flights-container">
                <div v-for="(flight, index) in cheapFlights" :key="flight._id" class="flight-card" @click="setPresetSearch(flight)">
                    <div class="flight-card-inner">
                        <div class="slide-counter">{{index + 1}}/{{cheapFlights.length}}</div>
                        <div class="flight-image-container">
                            <img 
                                :src="getImageUrl(flight.image)"
                                class="flight-image"
                                alt="Flight Image"
                            >
                        </div>
                        <div class="flight-info-overlay">
                            <div class="flight-route">
                                <div class="flight-cities">{{ flight.fromCity }} Đến</div>
                                <div class="flight-destination">{{ flight.toCity }}</div>
                            </div>
                            <div class="flight-date">{{ formatDateShort(flight.date) }}</div>
                            <div class="flight-price-container">
                                <div class="price-label">Từ</div>
                                <div class="price-value">{{ formatPrice(flight.basePrice) }}*</div>
                                <div class="flight-type">Một chiều</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="no-flights">
                <p>Không có chuyến bay giá rẻ vào lúc này. Vui lòng thử lại sau.</p>
            </div>
        </div>
        <div class="bank-logos-container">
            <div class="bank-logos-grid">
                <div class="bank-logo-item">
                    <img src="/Logo-ACB.webp" alt="ACB">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-BIDV-.webp" alt="BIDV">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-HDBank.png" alt="HDBank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-MB-Bank-MBB.webp" alt="MB Bank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-Sacombank.webp" alt="Sacombank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-SCB-H.webp" alt="SCB">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-SHB.png" alt="SHB">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-TCB-V.webp" alt="Techcombank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-TPBank.webp" alt="TPBank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-Vietcombank.webp" alt="Vietcombank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-VietinBank-CTG-Te.webp" alt="VietinBank">
                </div>
                <div class="bank-logo-item">
                    <img src="/Logo-VPBank.webp" alt="VPBank">
                </div>
            </div>
        </div>
        <AppFooter />
    </div>
</template>

<script>
import AppHeader from "../../../components/client/AppHeader.vue";
import AppFooter from "../../../components/client/AppFooter.vue";
import FlightSearch from "../../../components/client/FlightSearch.vue";
import authService from "../../../services/client/auth.service";
import flightAPI from "../../../services/client/flight.service";

export default {
    components: {
        AppHeader,
        AppFooter,
        FlightSearch,
    },
    data() {
        return {
            cheapFlights: [],
            presetSearch: null,
            searchKey: 0,
            baseApiUrl: 'http://localhost:3000'
        }
    },
    mounted() {
        sessionStorage.clear();

        this.loadCheapFlights();
    },
    methods: {
        scrollToFlightSearch() {
            this.$refs.flightSearchRef.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        },  
        async refreshToken() {
            try {
                const newAccessToken = await authService.refreshAccessToken();
                console.log("New Access Token:", newAccessToken);
            } catch (error) {
                console.error("Error refreshing access token:", error);
            }
        },
        async loadCheapFlights() {
            try {
                const res = await flightAPI.getCheapFlights();
                this.cheapFlights = res.data.flights;
            } catch (err) {
                console.error("Lỗi khi lấy chuyến bay giá rẻ:", err);
            }
        },
        formatDate(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN");
        },
        formatDateShort(dateStr) {
            const d = new Date(dateStr);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        },
        formatPrice(price) {
            return price.toLocaleString("vi-VN") + " VND";
        },
        setPresetSearch(flight) {
            this.presetSearch = {
                from: flight.fromCity,
                to: flight.toCity,
                date: new Date(flight.date).toISOString().split("T")[0],
                tripType: "oneway",
                returnDate: '',
            };
            this.searchKey++; 
            this.scrollToFlightSearch();
        },
        getImageUrl(imagePath) {
            if (!imagePath) return null;
            
            if (imagePath.startsWith('http')) {
                return imagePath;
            }
            
            if (imagePath.startsWith('/')) {
                return `${this.baseApiUrl}${imagePath}`;
            } else {
                return `${this.baseApiUrl}/${imagePath}`;
            }
        },
    }
}
</script>

<style scoped>
.home-banner {
    margin-top: 2rem;
    position: relative;
    padding: 0 7rem;
}

.home-banner_image {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
    border-radius: 1.2rem;
    box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.1);
}

.buy-tickets-button {
    position: absolute;
    top: 22.5%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1.5rem 3.5rem;
    font-size: 1.8rem;
    font-weight: bold;
    background-color: #ff3333;
    color: white;
    border: none;
    border-radius: 3rem;
    cursor: pointer;
    box-shadow: 0 0.4rem 1.5rem rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
}

.buy-tickets-button:hover {
    background-color: #ff0000;
    box-shadow: 0 0.6rem 1.8rem rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1.05);
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0.4rem 1.5rem rgba(255, 0, 0, 0.3);
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 0 0.8rem 2.5rem rgba(255, 0, 0, 0.6);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0.4rem 1.5rem rgba(255, 0, 0, 0.3);
    }
}

.pulse {
    animation: pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.home-search {
    margin: 2.5rem 0;
}

.cheap-flights-section {
    padding: 5rem 16rem;
    width: 100%;
    box-sizing: border-box;
}

.section-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 2.5rem;
    padding-left: 1rem;
    border-left: 0.2rem solid #ccc;
}

.cheap-flights-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 2rem;
}

.flight-card {
    position: relative;
    height: 38rem;
    cursor: pointer;
    border-radius: 0.8rem;
    overflow: hidden;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flight-card:hover {
    transform: translateY(-0.5rem);
    box-shadow: 0 0.8rem 1.6rem rgba(0, 0, 0, 0.2);
}

.flight-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
}

.slide-counter {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 1.5rem;
    font-size: 1.2rem;
    z-index: 1;
}

.flight-image-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.flight-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.flight-info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 65%;
    background: linear-gradient(to top, 
        rgba(0, 46, 93, 0.95) 0%,
        rgba(0, 59, 106, 0.85) 50%,
        rgba(7, 64, 140, 0.3) 100%);
    color: white;
    padding: 2rem;
    display: flex;
    flex-direction: column;
}

.flight-route {
    margin-bottom: 0.5rem;
}

.flight-cities {
    font-size: 1.8rem;
}

.flight-destination {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.flight-date {
    margin-bottom: 6.5rem;
    font-size: 1.4rem;
}

.flight-price-container {
    margin-top: auto;
    text-align: right;
}

.price-label {
    text-align: right;
    font-size: 1.4rem;
}

.price-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.flight-type {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
}

.no-flights {
    text-align: center;
    padding: 4rem 0;
    font-size: 1.6rem;
}

.bank-logos-container {
    width: 100%;
    padding: 15px;
    background-color: #f5f7fa;
}

.bank-logos-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
    max-width: 1200px;
    margin: 0 auto;
}

.bank-logo-item {
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    height: 70px;
    border: 1px solid #f0f0f0;
}

.bank-logo-item img {
    max-width: 100%;
    max-height: 40px;
    object-fit: contain;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .home-banner {
        margin-top: 1.5rem;
        padding: 0 1rem;
    }
    .home-banner_image {
        max-width: 100%;
        border-radius: 1rem;
    }
    .buy-tickets-button {
        display: none;
    }

    .cheap-flights-section {
        margin: 0;
        padding: 3rem 2rem;
    }

    .section-title {
        font-size: 1.8rem;
        margin-bottom: 2rem;
        padding-left: 0.8rem;
    }

    .cheap-flights-container {
        grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
        gap: 1.5rem;
    }

    .flight-card {
        height: 32rem;
        border-radius: 0.6rem;
    }

    .slide-counter {
        top: 0.8rem;
        left: 0.8rem;
        padding: 0.4rem 0.8rem;
        font-size: 1.1rem;
        border-radius: 1.2rem;
    }

    .flight-info-overlay {
        padding: 1.5rem;
        height: 60%;
    }

    .flight-cities {
        font-size: 1.6rem;
    }

    .flight-destination {
        font-size: 2.2rem;
        margin-bottom: 0.4rem;
    }

    .flight-date {
        margin-bottom: 4rem;
        font-size: 1.3rem;
    }

    .price-label {
        font-size: 1.3rem;
    }

    .price-value {
        font-size: 2.2rem;
        margin-bottom: 0.4rem;
    }

    .flight-type {
        font-size: 1.1rem;
    }

    .no-flights {
        padding: 3rem 0;
        font-size: 1.4rem;
    }

    .bank-logos-container {
        padding: 10px;
    }

    .bank-logos-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
    }

    .bank-logo-item {
        padding: 10px;
        height: 60px;
    }

    .bank-logo-item img {
        max-height: 35px;
    }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
    .home-banner {
        margin-top: 1rem;
        padding: 0 1rem;
    }
    .home-banner_image {
        max-width: 100%;
        border-radius: 0.8rem;
    }
    .buy-tickets-button {
        display: none;
    }

    .cheap-flights-section {
        margin: 0;
        padding: 2rem 1rem;
    }

    .section-title {
        font-size: 1.6rem;
        margin-bottom: 1.5rem;
        padding-left: 0.6rem;
        border-left: 0.15rem solid #ccc;
    }

    .cheap-flights-container {
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        gap: 1rem;
    }

    .flight-card {
        height: 28rem;
        border-radius: 0.5rem;
    }

    .slide-counter {
        top: 0.6rem;
        left: 0.6rem;
        padding: 0.3rem 0.7rem;
        font-size: 1rem;
        border-radius: 1rem;
    }

    .flight-info-overlay {
        padding: 1rem;
        height: 55%;
    }

    .flight-cities {
        font-size: 1.4rem;
    }

    .flight-destination {
        font-size: 1.8rem;
        margin-bottom: 0.3rem;
    }

    .flight-date {
        margin-bottom: 3rem;
        font-size: 1.2rem;
    }

    .price-label {
        font-size: 1.2rem;
    }

    .price-value {
        font-size: 1.8rem;
        margin-bottom: 0.3rem;
    }

    .flight-type {
        font-size: 1rem;
    }

    .no-flights {
        padding: 2rem 0;
        font-size: 1.3rem;
    }

    .bank-logos-container {
        padding: 8px;
    }

    .bank-logos-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 2px;
    }

    .bank-logo-item {
        padding: 8px;
        height: 50px;
    }

    .bank-logo-item img {
        max-height: 30px;
    }
}

/* Mobile (portrait): 320px - 480px */
@media (max-width: 480px) {
    .home-banner {
        margin-top: 0.8rem;
        padding: 0.5rem;
    }
    .home-banner_image {
        max-width: 100%;
        border-radius: 0.6rem;
    }
    .buy-tickets-button {
        display: none;
    }

    .cheap-flights-section {
        margin: 0;
        padding: 1.5rem 0.5rem;
    }

    .section-title {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        padding-left: 0.5rem;
        border-left: 0.1rem solid #ccc;
    }

    .cheap-flights-container {
        grid-template-columns: 1fr; 
        gap: 0.8rem;
    }

    .flight-card {
        height: 24rem;
        border-radius: 0.4rem;
    }

    .slide-counter {
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.2rem 0.6rem;
        font-size: 0.9rem;
        border-radius: 0.8rem;
    }

    .flight-info-overlay {
        padding: 0.8rem;
        height: 50%;
    }

    .flight-cities {
        font-size: 1.2rem;
    }

    .flight-destination {
        font-size: 1.6rem;
        margin-bottom: 0.2rem;
    }

    .flight-date {
        margin-bottom: 2rem;
        font-size: 1rem;
    }

    .price-label {
        font-size: 1rem;
    }

    .price-value {
        font-size: 1.6rem;
        margin-bottom: 0.2rem;
    }

    .flight-type {
        font-size: 0.9rem;
    }

    .no-flights {
        padding: 1.5rem 0;
        font-size: 1.2rem;
    }

    .bank-logos-container {
        padding: 5px;
    }

    .bank-logos-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1px;
    }

    .bank-logo-item {
        padding: 5px;
        height: 40px;
    }

    .bank-logo-item img {
        max-height: 25px;
    }
}
</style>