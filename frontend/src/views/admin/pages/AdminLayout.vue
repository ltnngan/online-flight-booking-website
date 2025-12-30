<template>
  <div class="layout">
    <!-- Thanh điều hướng bên trái -->
    <div :class="['sidebar', { collapsed: isCollapsed }]">
      <div class="logo" :class="{ collapsed: isCollapsed }">
        <div v-if="!isCollapsed" class="logo-container">
          <div class="header_logo-image">
            <img src="/Logo.png" alt="Logo STAR Air" />
          </div>
          <div class="header_logo-text">
            <span>STAR Air</span>
          </div>
        </div>
        <i v-else class="fas fa-home logo-icon"></i>
      </div>
      <ul class="sidebar-menu">
        <li
          :class="['menu-item', { active: activeMenu === '1' }]"
          @click="navigateTo('/admin/dashboard', '1')"
        >
          <i class="fas fa-chart-bar"></i>
          <span v-if="!isCollapsed">Thống kê</span>
        </li>
        <!-- Menu Chuyến bay -->
        <li :class="['menu-item', 'has-submenu']">
          <div
            class="menu-item-header"
            @click="toggleSubmenu('flight')"
          >
            <div>
              <i class="fas fa-plane"></i>
              <span v-if="!isCollapsed">Chuyến bay</span>
            </div>
            <i
              v-if="!isCollapsed"
              :class="['fas', 'fa-chevron-right', 'submenu-toggle', { rotated: openSubmenus.flight }]"
              style="font-size: 1.2rem; color: #a6a6a6"
            ></i>
          </div>
          <ul v-show="openSubmenus.flight" class="submenu">
            <div class="submenu-item">
              <i class="fa-solid fa-eye"></i>
              <li
                :class="{ active: activeMenu === '2-1' }"
                @click.stop="navigateTo('/admin/flights', '2-1')"
              >
                Danh sách chuyến bay
              </li>
            </div>
            <div class="submenu-item">
              <i class="fa-solid fa-plus"></i>
              <li
                :class="{ active: activeMenu === '2-2' }"
                @click.stop="navigateTo('/admin/flights/create', '2-2')"
              >
                Thêm chuyến bay
              </li>
            </div>
          </ul>
        </li>
        <!-- Menu Tuyến bay -->
        <li :class="['menu-item', 'has-submenu']">
          <div
            class="menu-item-header"
            @click="toggleSubmenu('route')"
          >
            <div>
              <i class="fas fa-route"></i>
              <span v-if="!isCollapsed">Tuyến bay</span>
            </div>
            <i
              v-if="!isCollapsed"
              :class="['fas', 'fa-chevron-right', 'submenu-toggle', { rotated: openSubmenus.route }]"
              style="font-size: 1.2rem; color: #a6a6a6"
            ></i>
          </div>
          <ul v-show="openSubmenus.route" class="submenu">
            <div class="submenu-item">
              <i class="fa-solid fa-eye"></i>
              <li
                :class="{ active: activeMenu === '3-1' }"
                @click.stop="navigateTo('/admin/flight-routes/get', '3-1')"
              >
                Danh sách tuyến bay
              </li>
            </div>
            <div class="submenu-item">
              <i class="fa-solid fa-plus"></i>
              <li
                :class="{ active: activeMenu === '3-2' }"
                @click.stop="navigateTo('/admin/flight-routes/post', '3-2')"
              >
                Thêm tuyến bay
              </li>
            </div>
          </ul>
        </li>
        <li
          :class="['menu-item', { active: activeMenu === '4' }]"
          @click="navigateTo('/admin/user', '4')"
        >
          <i class="fas fa-users"></i>
          <span v-if="!isCollapsed">Người dùng</span>
        </li>
        <li
          :class="['menu-item', { active: activeMenu === '5' }]"
          @click="navigateTo('/admin/booking', '5')"
        >
          <i class="fas fa-ticket-alt"></i>
          <span v-if="!isCollapsed">Đặt vé</span>
        </li>
      </ul>
    </div>

    <div class="main-container">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <button class="collapse-btn" @click="toggleCollapse">
            <i class="fas fa-bars"></i>
          </button>
        </div>
        <div class="header-right">
          <div class="user-info" @click="toggleUserMenu">
            <i class="fas fa-user-circle"></i>
            <span v-if="!isCollapsed">Admin</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <ul v-if="showUserMenu" class="user-menu">
            <li>Thông tin cá nhân</li>
            <li @click.prevent="handleLogout">Đăng xuất</li>
          </ul>
        </div>
      </header>

      <!-- Nội dung chính -->
      <main class="main-content">
        <div class="breadcrumb">
          <span>Trang chủ</span><span>{{ currentPage }}</span>
        </div>
        <div class="content-box">
          <h2>{{ currentPage }}</h2>
          <!-- Router-view hiển thị component tương ứng ngay tại đây -->
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import authService from '../../../services/admin/auth.service'

export default {
  data() {
    return {
      isCollapsed: false,
      activeMenu: "1",
      showUserMenu: false,
      openSubmenus: {
        flight: false,
        route: false,
      },
      menuMap: {
        "1": "Thống kê",
        "2-1": "Danh sách chuyến bay",
        "2-2": "Thêm chuyến bay",
        "3-1": "Danh sách tuyến bay",
        "3-2": "Tạo tuyến bay",
        "4": "Người dùng",
        "5": "Đặt vé",
      }
    };
  },

  computed: {
    currentPage() {
      return this.menuMap[this.activeMenu] || "Thống kê";
    }
  },

  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    navigateTo(path, menuIndex) {
      this.activeMenu = menuIndex;
      
      // Chỉ chuyển hướng nếu đường dẫn hiện tại khác với đường dẫn yêu cầu
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
      
      // Đóng menu người dùng nếu đang mở
      if (this.showUserMenu) {
        this.showUserMenu = false;
      }
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    toggleSubmenu(menu) {
      // Giữ trạng thái mở của submenu hiện tại, đóng các submenu khác
      Object.keys(this.openSubmenus).forEach(key => {
        if (key !== menu) {
          this.openSubmenus[key] = false;
        }
      });
      this.openSubmenus[menu] = !this.openSubmenus[menu];
    },
    async handleLogout() {
            try {
                await authService.logout()

                this.currentUser = null;
                this.$router.push('/admin/login')
            } catch (error) {
                console.error('Lỗi đăng xuất:', error);
            }
        },
    
    // Cập nhật activeMenu dựa vào đường dẫn hiện tại
    updateActiveMenuFromRoute() {
      const routeToMenuMap = {
        "/admin/dashboard": "1",
        "/admin/flights": "2-1",
        "/admin/flights/create": "2-2",
        "/admin/flight-routes/get": "3-1",
        "/admin/flight-routes/post": "3-2",
        "/admin/user": "4",
        "/admin/booking": "5",
      };
      
      const menu = routeToMenuMap[this.$route.path];
      if (menu) {
        this.activeMenu = menu;
        
        // Mở submenu nếu cần
        if (menu.startsWith("2-")) {
          this.openSubmenus.flight = true;
        } else if (menu.startsWith("3-")) {
          this.openSubmenus.route = true;
        }
      }
    }
  },
  
  // Khi component được tạo, cập nhật activeMenu dựa vào đường dẫn
  created() {
    this.updateActiveMenuFromRoute();
    
    // Thêm event listener để đóng menu người dùng khi click ra ngoài
    document.addEventListener('click', (e) => {
      const userMenu = document.querySelector('.user-info');
      const userMenuDropdown = document.querySelector('.user-menu');
      
      if (userMenu && userMenuDropdown && this.showUserMenu && 
          !userMenu.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        this.showUserMenu = false;
      }
    });
  },
  
  // Khi component bị hủy, loại bỏ event listener
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  
  // Khi route thay đổi, cập nhật activeMenu
  watch: {
    '$route'() {
      this.updateActiveMenuFromRoute();
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Sidebar Styling */
.sidebar {
  width: 28rem;
  background: #ffffff;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: fixed; /* Thay đổi từ relative sang fixed */
  height: 100vh; /* Đảm bảo sidebar cao bằng chiều cao của viewport */
  z-index: 10;
  border-right: 0.1rem solid rgba(0, 0, 0, 0.05);
  overflow-y: auto; /* Cho phép cuộn nếu menu quá dài */
}


.sidebar.collapsed {
  width: 7rem;
}

.logo {
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 3.95rem 2.4rem;
  color: #1e1e1e;
  font-size: 1.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 0.1rem solid rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.header_logo-image img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5.5rem;
  height: auto;
}

.header_logo-text span {
  font-weight: bold;
  font-size: 2.5rem;
  color: #475569;
}

.logo.collapsed {
  justify-content: center;
}

.logo-icon {
  font-size: 2.4rem;
  color: #ffc107;
}

.sidebar-menu {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.menu-item {
  color: #334155;
  padding: 1.2rem 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.8rem;
  margin: 0.4rem 0.8rem;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  margin: 0.4rem;
}

.menu-item i {
  margin-right: 1.4rem;
  font-size: 1.6rem;
  min-width: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  color: #475569;
}

.sidebar.collapsed .menu-item i {
  margin-right: 0;
  font-size: 1.4rem;
}

.menu-item:hover {
  background-color: rgba(255, 193, 7, 0.1);
  color: #1e1e1e;
  transform: translateY(-0.1rem);
}

.menu-item.active {
  background: linear-gradient(
    90deg,
    rgba(255, 193, 7, 0.2),
    rgba(255, 193, 7, 0.1)
  );
  font-weight: bold;
  color: #343e4c;
  box-shadow: 0 0.2rem 0.8rem rgba(255, 193, 7, 0.2);
}

.menu-item.active i {
  color: #343e4c;
}

/* Submenu Styling with <div> */
.has-submenu {
  padding: 0;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.6rem 1rem 5.5rem;
}

.submenu-item i {
  color: #475569;
  margin-right: 1rem;
  font-size: 1.4rem;
}

.sidebar.collapsed .submenu {
  display: none;
}

.menu-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  cursor: pointer;
  color: #334155;
}

.menu-item-header > div {
  display: flex;
  align-items: center;
}

.submenu-toggle {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: #ffc107;
}

.submenu-toggle.rotated {
  transform: rotate(90deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0;
  border-radius: 0.6rem;
  transition: all 0.3s ease;
}

.submenu li {
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.4rem;
  border-radius: 0.6rem;
  padding: 0.5rem 1rem;
}

.submenu li:hover {
  background-color: rgba(255, 193, 7, 0.1);
  color: #1e1e1e;
}

.submenu li.active {
  background-color: rgba(255, 193, 7, 0.15);
  font-weight: bold;
}

/* Main Container Styling */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  margin-left: 28rem; /* Thêm margin trái bằng với chiều rộng của sidebar */
  transition: margin-left 0.3s ease; /* Thêm transition để mượt mà khi toggle sidebar */
}

.sidebar.collapsed + .main-container {
  margin-left: 7rem;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.4rem;
  box-shadow: 0 0.2rem 1rem rgba(0, 0, 0, 0.05);
  height: 7.9rem;
  position: fixed; /* Thay đổi từ sticky sang fixed */
  top: 0;
  right: 0; /* Căn phải */
  z-index: 5;
  border-bottom: 0.1rem solid rgba(0, 0, 0, 0.03);
  width: calc(100% - 28rem); /* Chiều rộng = 100% trừ đi chiều rộng của sidebar */
  transition: width 0.3s ease; /* Thêm transition khi thay đổi kích thước */
}

.sidebar.collapsed ~ .main-container .header {
  width: calc(100% - 7rem); /* Chiều rộng = 100% trừ đi chiều rộng của sidebar khi collapsed */
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  position: relative;
}

.user-info {
  color: #0f172a;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: #f1f5f9;
  padding: 0.8rem 1.6rem;
  border-radius: 2.4rem;
  transition: all 0.2s ease;
  border: 0.1rem solid rgba(0, 0, 0, 0.03);
}

.user-info:hover {
  background: #e2e8f0;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.1);
}

.user-info i.fa-user-circle {
  font-size: 2rem;
  margin-right: 1rem;
  color: #ffc107;
}

.user-info .fa-chevron-down {
  margin-left: 1rem;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
  color: #ffc107;
}

.user-menu {
  position: absolute;
  top: 6rem;
  right: 0;
  background: #fff;
  box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.8rem 0;
  margin: 0;
  border-radius: 1.2rem;
  z-index: 1000;
  min-width: 18rem;
  border: 0.1rem solid rgba(0, 0, 0, 0.05);
}

.user-menu li {
  padding: 1rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #334155;
  display: flex;
  align-items: center;
}

.user-menu li:hover {
  background: #f8fafc;
  color: #ffc107;
}

.collapse-btn {
  font-size: 1.6rem;
  border: none;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: #e2e8f0;
  color: #ffc107;
  transform: translateX(0.2rem);
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1);
}

.main-content {
  padding: 2.4rem;
  background: #f8fafc;
  flex: 1;
  overflow-y: auto;
  margin-top: 7.9rem; /* Thêm margin-top bằng chiều cao của header */
}

.breadcrumb {
  margin-bottom: 2rem;
  font-size: 1.4rem;
  color: #64748b;
  display: flex;
  align-items: center;
}

.breadcrumb span {
  display: inline-flex;
  align-items: center;
}

.breadcrumb span:not(:last-child)::after {
  content: "/";
  margin: 0 0.8rem;
  color: #cbd5e1;
}

.breadcrumb span:last-child {
  color: #ffc107;
  font-weight: 500;
}

.content-box {
  background: #fff;
  padding: 2.8rem;
  border-radius: 1.6rem;
  box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.04);
  min-height: 38rem;
  transition: all 0.3s ease;
  border: 0.1rem solid rgba(0, 0, 0, 0.03);
}

.content-box:hover {
  box-shadow: 0 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
  transform: translateY(-0.2rem);
}

.content-box h2 {
  margin: 0 0 2rem;
  font-size: 2.4rem;
  color: #0f172a;
  font-weight: 600;
  position: relative;
  padding-bottom: 1rem;
}

.content-box h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 4rem;
  height: 0.3rem;
  background-color: #ffc107;
  border-radius: 0.2rem;
}

.content-box p {
  font-size: 1.6rem;
  color: #475569;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(-100%);
    z-index: 20;
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .header {
    padding: 0 1.6rem;
  }

  .content-box {
    padding: 2rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.content-box {
  animation: fadeIn 0.5s ease;
}

/* Button styling */
button {
  font-family: "Lato", sans-serif;
  font-weight: 500;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 0.8rem;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 1rem;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 1rem;
}

::-webkit-scrollbar-thumb:hover {
  background: #ffc107;
}
</style>