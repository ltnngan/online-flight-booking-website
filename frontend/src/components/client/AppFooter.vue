<template>
  <footer class="footer-container">
    <div class="footer-content">
      <div class="footer-column">
        <div class="footer-logo">
          <h3>STAR Air</h3>
        </div>
        <p>Chuyến bay an toàn, dịch vụ tiện nghi cho mọi hành trình của bạn</p>
        <div class="contact-info">
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <span>1900 1234 56</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>support@starair.com</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>123 Đường ABC, Hưng Lợi, TP.Cần Thơ</span>
          </div>
        </div>
      </div>

      <div class="footer-column">
        <h4>Liên kết nhanh</h4>
        <ul class="footer-links">
          <li><a href="#">Về chúng tôi</a></li>
          <li><a href="#">Dịch vụ</a></li>
          <li><a href="#">Điểm đến</a></li>
          <li><a href="#">Khuyến mãi</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Dịch vụ</h4>
        <ul class="footer-links">
          <li><a href="#">Đặt vé</a></li>
          <li><a href="#">Check-in online</a></li>
          <li><a href="#">Hành lý</a></li>
          <li><a href="#">Hỗ trợ đặc biệt</a></li>
          <li><a href="#">Bữa ăn trên máy bay</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>Kết nối với chúng tôi</h4>
        <div class="social-media">
          <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <div class="copyright">
          <p>© 2025 STAR Air. All Rights Reserved.</p>
        </div>
        <div class="footer-bottom-links">
          <a href="#">Điều khoản sử dụng</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  background-color: #003366;
  color: #f0f4f8;
  padding: 3rem 0 0;
  font-family: 'Roboto', sans-serif;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  gap: 1.5rem;
}

.footer-column {
  padding: 1rem;
}

.footer-logo h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.footer-column p {
  line-height: 1.5;
  color: #b0c4de;
  margin-bottom: 1rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-item i {
  color: #4db8ff;
  margin-right: 1rem;
  font-size: 1.6rem;
}

h4 {
  font-size: 1.6rem; 
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 1rem;
  position: relative;
}

h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.25rem;
  width: 30px;
  height: 2px;
  background-color: #4db8ff;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #b0c4de;
  text-decoration: none;
}

.footer-links a:hover {
  color: #4db8ff;
}

.social-media {
  display: flex;
  gap: 0.75rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #ffffff1a;
  border-radius: 50%;
  color: #ffffff;
}

.social-icon:hover {
  background-color: #4db8ff;
}

.footer-bottom {
  background-color: #002447;
  padding: 1rem 0;
  margin-top: 2rem;
}

.footer-bottom .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright p {
  color: #b0c4de;
}

.footer-bottom-links {
  display: flex;
  gap: 1rem;
}

.footer-bottom-links a {
  color: #b0c4de;
  text-decoration: none;
}

.footer-bottom-links a:hover {
  color: #4db8ff;
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1.2rem;
  }

  .footer-column {
    padding: 0.8rem;
  }

  .footer-logo h3 {
    font-size: 1.8rem;
  }

  .footer-column p {
    font-size: 1.3rem;
  }

  .contact-item {
    font-size: 1.3rem;
  }

  .contact-item i {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  .footer-links a {
    font-size: 1.3rem;
  }

  .social-icon {
    width: 32px;
    height: 32px;
    font-size: 1.3rem;
  }

  .footer-bottom .container {
    padding: 0 0.8rem;
  }

  .copyright p {
    font-size: 1.3rem;
  }

  .footer-bottom-links a {
    font-size: 1.3rem;
  }
}

/* Mobile (landscape): 480px - 768px */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr; 
    text-align: center;
    gap: 1rem;
  }

  .footer-column {
    padding: 0.6rem;
  }

  .footer-logo h3 {
    font-size: 1.6rem;
  }

  .footer-column p {
    font-size: 1.2rem;
  }

  .contact-item {
    justify-content: center;
    font-size: 1.2rem;
  }

  .contact-item i {
    font-size: 1.4rem;
  }

  h4 {
    font-size: 1.4rem;
  }

  h4::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-links a {
    font-size: 1.2rem;
  }

  .social-media {
    justify-content: center;
  }

  .social-icon {
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
  }

  .footer-bottom .container {
    flex-direction: column;
    text-align: center;
    padding: 0 0.6rem;
  }

  .copyright p {
    font-size: 1.2rem;
  }

  .footer-bottom-links {
    margin-top: 0.5rem;
  }

  .footer-bottom-links a {
    font-size: 1.2rem;
  }
}

/* Mobile (portrait): 320px - 480px */
@media (max-width: 480px) {
  .footer-container {
    padding: 2rem 0 0;
  }

  .footer-content {
    padding: 0 0.5rem;
    gap: 0.8rem;
  }

  .footer-column {
    padding: 0.5rem;
  }

  .footer-logo h3 {
    font-size: 1.4rem;
  }

  .footer-column p {
    font-size: 1rem;
  }

  .contact-item {
    font-size: 1rem;
  }

  .contact-item i {
    font-size: 1.2rem;
  }

  h4 {
    font-size: 1.2rem;
  }

  .footer-links li {
    margin-bottom: 0.4rem;
  }

  .footer-links a {
    font-size: 1rem;
  }

  .social-icon {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }

  .footer-bottom {
    margin-top: 1.5rem;
    padding: 0.8rem 0;
  }

  .footer-bottom .container {
    padding: 0 0.5rem;
  }

  .copyright p {
    font-size: 1rem;
  }

  .footer-bottom-links a {
    font-size: 1rem;
  }
}
</style>