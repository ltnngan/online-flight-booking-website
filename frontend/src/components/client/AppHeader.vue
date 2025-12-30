<template>
    <header class="header">
        <div class="header_container">
            <div class="header_brand">
                <router-link to="/home" class="header_logo header_link">
                    <div class="header_logo-image">
                        <img src="../../../Logo.png" alt="Logo STAR Air">
                    </div>
                    <div class="header_logo-text">
                        <span>STAR Air</span>
                    </div>
                </router-link>
            </div>

            <button class="hamburger" @click="toggleMenu">
                <i class="fa-solid fa-bars"></i>
            </button>

            <div class="header_nav" :class="{ 'show': isMenuOpen }">
                <router-link to="/home" class="header_link">TRANG CHỦ</router-link>

                <template v-if="currentUser">
                    <div class="header_user">
                        <router-link to="/account" class="header_link">TÀI KHOẢN</router-link>
                        <div class="header_separator"></div>
                        <div class="header_user-info">
                            <img 
                                :src="getAvatarUrl(currentUser.avatar)"
                                alt="Avatar" 
                                class="header_avatar"
                            />
                            <span class="header_greeting">Xin Chào, {{currentUser.fullName}}</span>
                        </div>
                        <div class="header_separator"></div>
                        <a href="#" @click.prevent="handleLogout" class="header_link">ĐĂNG XUẤT</a>
                    </div>
                </template>
                <template v-else>
                    <div class="header_auth">
                        <router-link to="/my-flights" class="header_link">CHUYẾN BAY CỦA TÔI</router-link>
                        <div class="header_separator"></div>
                        <router-link to="/login" class="header_link">ĐĂNG NHẬP</router-link>
                        <router-link to="/register" class="header_link">ĐĂNG KÝ</router-link>
                    </div>
                </template>
            </div>
        </div>
    </header>
</template>

<script>
import authService from '../../services/client/auth.service'
import defaultAvatar from '/default-avatar.jpg';

export default {
    name: 'AppHeader',
    data() {
        return {
            currentUser: null,
            isMenuOpen: false
        }
    },
    created() {
        this.currentUser = authService.getCurrentUser()
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen
        },
        getAvatarUrl(path) {
            if (!path) {
                return defaultAvatar;
            }

            const baseURL = 'http://localhost:3000'
            return `${baseURL}${path}`
        },
        async handleLogout() {
            try {
                await authService.logout()

                this.currentUser = null;
                this.$router.push('/home')
            } catch (error) {
                console.error('Lỗi đăng xuất:', error);
            }
        }
    },
    watch: {
        $route() {
            this.currentUser = authService.getCurrentUser()
            this.isMenuOpen = false // Close menu on route change
        }
    }
}
</script>

<style scoped>
.header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: white;
    box-shadow: 0 0.2rem 0.6rem rgba(55, 65, 81, 0.1);
}

.header_container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 10rem;
    max-width: 140rem;
    margin: 0 6rem;
}

.header_link {
    text-decoration: none;
    color: #374151;
    font-size: 1.4rem;
}

.header_logo {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.header_logo-image img {
    width: 5.5rem;
    height: auto;
}

.header_logo-text span {
    font-weight: bold;
    font-size: 2.5rem;
}

.header_nav {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
}

.header_separator {
    height: 2rem;
    width: 0.15rem;
    background-color: #ccc;
}

.header_user {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
}

.header_user-info {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
}

.header_avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 0.2rem solid #ccc;
}

.header_auth {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
}

.hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.8rem;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .header_container {
        padding: 1rem 2rem;
        margin: 0;
        max-width: 100%;
    }

    .header_logo-image img {
        width: 4.5rem;
    }

    .header_logo-text span {
        font-size: 2rem;
    }

    .header_link {
        font-size: 1.2rem;
    }

    .header_avatar {
        width: 2rem;
        height: 2rem;
    }

    .header_separator {
        height: 1.8rem;
    }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
    .header_container {
        padding: 1rem;
    }

    .hamburger {
        display: block;
    }

    .header_nav {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        padding: 1rem;
        box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.2);
    }

    .header_nav.show {
        display: flex;
    }

    .header_user,
    .header_auth {
        flex-direction: column;
        gap: 0.8rem;
        width: 100%;
    }

    .header_link {
        width: 100%;
        text-align: center;
        padding: 0.6rem;
        font-size: 1.1rem;
    }

    .header_logo-image img {
        width: 4rem;
    }

    .header_logo-text span {
        font-size: 1.8rem;
    }

    .header_separator {
        display: none;
    }

    .header_user-info {
        display: none;
    }

    .hamburger {
        font-size: 1.6rem;
    }
}

/* Mobile (portrait): 320px - 480px */
@media (max-width: 480px) {
    .header_container {
        padding: 0.8rem;
    }

    .header_logo-image img {
        width: 3.5rem;
    }

    .header_logo-text span {
        font-size: 1.5rem;
    }

    .header_link {
        font-size: 1rem;
        padding: 0.5rem;
    }

    .header_nav {
        padding: 0.8rem;
    }

    .hamburger {
        font-size: 1.4rem;
    }
}
</style>