/**
 * TrendMart - Global JavaScript Engine
 * Xử lý giỏ hàng localStorage, badge đếm, Toast notification, countdown deal, mobile nav
 */

const STORAGE_KEYS = {
  CART: 'trendmart_cart_v1',
  WISHLIST: 'trendmart_wishlist_v1',
  COUPON: 'trendmart_coupon_v1',
  THEME: 'trendmart_theme_v1',
  AUTH_USER: 'trendmart_auth_user_v1',
  USERS_DB: 'trendmart_users_db_v1'
};

// ==========================================
// 1. TIỆN ÍCH ĐỊNH DẠNG & TOAST
// ==========================================

/**
 * Định dạng số thành tiền VND (Ví dụ: 1.890.000₫)
 */
function formatVND(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace(/\s/g, '');
}

/**
 * Hiển thị Toast Notification góc phải màn hình
 */
function showToast(title, message = '', type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // SVG Icons theo type
  let iconSVG = '';
  if (type === 'success') {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'warning') {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'danger') {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSVG}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  // Tự huỷ sau khoảng thời gian
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// ==========================================
// 2. QUẢN LÝ GIỎ HÀNG (LOCALSTORAGE)
// ==========================================

const CartService = {
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Lỗi khi đọc giỏ hàng từ localStorage:', e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      this.updateCartBadge();
      window.dispatchEvent(new CustomEvent('cartChanged', { detail: cart }));
    } catch (e) {
      console.error('Lỗi khi lưu giỏ hàng:', e);
    }
  },

  addItem(productId, quantity = 1) {
    const product = window.TrendMartData?.getProductById(productId);
    if (!product) {
      showToast('Lỗi', 'Không tìm thấy thông tin sản phẩm', 'danger');
      return false;
    }

    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast('Giới hạn số lượng', `Sản phẩm này chỉ còn ${product.stock} món trong kho!`, 'warning');
        return false;
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        showToast('Giới hạn số lượng', `Sản phẩm này chỉ còn ${product.stock} món trong kho!`, 'warning');
        return false;
      }
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        categoryName: product.categoryName,
        stock: product.stock,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    showToast('Thêm thành công! 🎉', `${product.name} đã được thêm vào giỏ.`, 'success');
    return true;
  },

  updateQuantity(productId, quantity) {
    let cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.id === Number(productId));

    if (itemIndex === -1) return;

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const product = window.TrendMartData?.getProductById(productId);
    const maxStock = product ? product.stock : cart[itemIndex].stock;

    if (quantity > maxStock) {
      showToast('Số lượng tối đa', `Rất tiếc, kho chỉ còn ${maxStock} sản phẩm!`, 'warning');
      cart[itemIndex].quantity = maxStock;
    } else {
      cart[itemIndex].quantity = quantity;
    }

    this.saveCart(cart);
  },

  removeItem(productId) {
    let cart = this.getCart();
    const removedItem = cart.find(item => item.id === Number(productId));
    cart = cart.filter(item => item.id !== Number(productId));
    this.saveCart(cart);
    if (removedItem) {
      showToast('Đã xóa', `Đã xóa sản phẩm khỏi giỏ hàng.`, 'warning');
    }
  },

  clearCart() {
    localStorage.removeItem(STORAGE_KEYS.CART);
    this.updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: [] }));
  },

  getTotalCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  },

  getSubtotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  updateCartBadge() {
    const totalCount = this.getTotalCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = totalCount;
      badge.classList.remove('bump');
      // Trigger reflow to restart animation
      void badge.offsetWidth;
      badge.classList.add('bump');
    });
  }
};

// ==========================================
// 3. QUẢN LÝ DANH SÁCH YÊU THÍCH (WISHLIST)
// ==========================================

const WishlistService = {
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isWishlisted(productId) {
    const list = this.getWishlist();
    return list.includes(Number(productId));
  },

  toggle(productId, buttonElement) {
    let list = this.getWishlist();
    const id = Number(productId);
    const product = window.TrendMartData?.getProductById(id);

    if (list.includes(id)) {
      list = list.filter(item => item !== id);
      if (buttonElement) buttonElement.classList.remove('active');
      showToast('Đã bỏ thích', `Đã xóa khỏi danh sách yêu thích`, 'info');
    } else {
      list.push(id);
      if (buttonElement) buttonElement.classList.add('active');
      showToast('Đã yêu thích ❤️', `${product ? product.name : 'Sản phẩm'} đã thêm vào yêu thích`, 'success');
    }

    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
  }
};

// ==========================================
// 4. TIỆN ÍCH COPY MÃ GIẢM GIÁ
// ==========================================

function copyCoupon(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Đã sao chép!', `Mã giảm giá ${code} đã sẵn sàng sử dụng trong giỏ hàng.`, 'success');
    }).catch(() => {
      fallbackCopy(code);
    });
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(code) {
  const input = document.createElement('input');
  input.value = code;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  showToast('Đã sao chép!', `Mã giảm giá ${code} đã sẵn sàng!`, 'success');
}

// ==========================================
// 5. HIỆU ỨNG ĐẾM NGƯỢC (DEAL OF THE DAY)
// ==========================================

function initCountdown() {
  const hoursEl = document.getElementById('deal-hours');
  const minutesEl = document.getElementById('deal-minutes');
  const secondsEl = document.getElementById('deal-seconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Lấy hoặc tạo thời điểm kết thúc (16 tiếng kể từ mốc cố định hàng ngày)
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  function updateTimer() {
    const current = new Date();
    const diff = endOfDay - current;

    if (diff <= 0) {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// 6. TẠO HTML PRODUCT CARD CHUẨN MỰC
// ==========================================

function renderProductCardHTML(product) {
  const isWish = WishlistService.isWishlisted(product.id);
  const badgeClass = product.badgeType || 'sale';

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-thumb-wrap">
        ${product.badge ? `<span class="badge-tag ${badgeClass}">${product.badge}</span>` : ''}
        
        <button class="btn-wishlist ${isWish ? 'active' : ''}" 
                onclick="WishlistService.toggle(${product.id}, this)" 
                title="Yêu thích sản phẩm"
                aria-label="Yêu thích sản phẩm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <img src="${product.image}" 
             alt="${product.name}" 
             loading="lazy" 
             onerror="this.onerror=null; this.src='${window.TrendMartData?.fallbackImage}';">
      </div>

      <div class="product-body">
        <div class="product-meta">
          <span class="product-category-name">${product.categoryName}</span>
          <span class="product-rating">
            <svg class="rating-star-icon" width="13" height="13" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            ${product.rating} <span style="font-weight:400; color:var(--text-muted);">(${product.reviewsCount})</span>
          </span>
        </div>

        <h3 class="product-name" title="${product.name}">
          <a href="shop.html?search=${encodeURIComponent(product.name)}">${product.name}</a>
        </h3>

        <div class="product-stock-bar">
          <span class="stock-indicator ${product.stock <= 10 ? 'low' : ''}"></span>
          <span>${product.stock <= 10 ? `Chỉ còn ${product.stock} món!` : `Còn ${product.stock} trong kho`}</span>
        </div>

        <div class="product-footer-row">
          <div class="price-box">
            <span class="price-current">${formatVND(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${formatVND(product.originalPrice)}</span>` : ''}
          </div>

          <button class="btn-add-cart" 
                  onclick="CartService.addItem(${product.id}, 1)" 
                  title="Thêm vào giỏ hàng"
                  aria-label="Thêm vào giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              <line x1="12" y1="9" x2="12" y2="15"></line>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ==========================================
// 6.5. QUẢN LÝ GIAO DIỆN SÁNG / TỐI (THEME)
// ==========================================

const ThemeService = {
  init() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.setTheme(saved, false);
  },

  setTheme(theme, showNotice = false) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.updateToggleIcons(theme);
    if (showNotice) {
      showToast(theme === 'dark' ? '🌙 Chế độ Tối' : '☀️ Chế độ Sáng', 'Đã lưu tùy chọn giao diện', 'info', 1600);
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next, true);
  },

  updateToggleIcons(theme) {
    const isDark = theme === 'dark';
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    buttons.forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối');
      btn.innerHTML = isDark
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });

    const bottomToggle = document.getElementById('bottom-nav-theme-text');
    if (bottomToggle) {
      bottomToggle.textContent = isDark ? 'Sáng' : 'Tối';
    }
  }
};

// ==========================================
// 6.6. HỆ THỐNG ĐĂNG NHẬP / ĐĂNG KÝ (AUTH)
// ==========================================

const AuthService = {
  getLoggedUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  getUsersDatabase() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      return data ? JSON.parse(data) : [
        { name: 'Nguyễn Văn An', email: 'demo@trendmart.vn', phone: '0912345678', password: '123' }
      ];
    } catch (e) {
      return [];
    }
  },

  saveUsersDatabase(users) {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  },

  init() {
    // Đảm bảo có sẵn tài khoản mẫu demo
    if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
      this.saveUsersDatabase([
        { name: 'Nguyễn Văn An', email: 'demo@trendmart.vn', phone: '0912345678', password: '123' }
      ]);
    }
    this.updateUI();
    this.bindAuthModal();
  },

  login(identifier, password) {
    const users = this.getUsersDatabase();
    const id = identifier.trim().toLowerCase();
    const user = users.find(u => (u.email.toLowerCase() === id || u.phone === id) && u.password === password);

    if (user) {
      const sessionUser = { name: user.name, email: user.email, phone: user.phone };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(sessionUser));
      this.updateUI();
      this.closeModal();
      showToast('Đăng nhập thành công! 👋', `Xin chào, ${user.name}`, 'success');

      // Tự điền thông tin nếu đang ở trang giỏ hàng
      if (typeof window.autoFillCheckoutUser === 'function') {
        window.autoFillCheckoutUser();
      }
      return true;
    } else {
      showToast('Đăng nhập thất bại', 'Email / SĐT hoặc mật khẩu không chính xác', 'danger');
      return false;
    }
  },

  register(name, email, phone, password) {
    const users = this.getUsersDatabase();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      showToast('Email đã tồn tại', 'Vui lòng đăng nhập hoặc sử dụng email khác', 'warning');
      return false;
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: password
    };

    users.push(newUser);
    this.saveUsersDatabase(users);

    // Tự động đăng nhập
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({ name: newUser.name, email: newUser.email, phone: newUser.phone }));
    this.updateUI();
    this.closeModal();
    showToast('Đăng ký thành công! 🎉', `Chào mừng ${newUser.name} đến với TrendMart`, 'success');

    if (typeof window.autoFillCheckoutUser === 'function') {
      window.autoFillCheckoutUser();
    }
    return true;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.updateUI();
    showToast('Đã đăng xuất', 'Hẹn gặp lại quý khách!', 'info');
  },

  openModal(tab = 'login') {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      this.createAuthModalHTML();
      modal = document.getElementById('auth-modal');
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.switchTab(tab);
    }
  },

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  switchTab(tab) {
    const tabLogin = document.getElementById('auth-tab-btn-login');
    const tabRegister = document.getElementById('auth-tab-btn-register');
    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');

    if (tab === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
    } else {
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (formRegister) formRegister.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
    }
  },

  toggleDropdown(btn) {
    const menu = btn.closest('.user-profile-menu');
    if (menu) {
      menu.classList.toggle('open');
    }
  },

  updateUI() {
    const user = this.getLoggedUser();
    const containers = document.querySelectorAll('.auth-btn-container');

    containers.forEach(container => {
      if (user) {
        const shortName = user.name.split(' ').pop();
        const initial = user.name.charAt(0).toUpperCase();

        container.innerHTML = `
          <div class="user-profile-menu">
            <button class="btn-user-profile" onclick="AuthService.toggleDropdown(this)" title="Tài khoản: ${user.name}">
              <div class="user-avatar">${initial}</div>
              <span class="user-name-text">${shortName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="user-dropdown-menu">
              <div class="dropdown-header">
                <div class="dropdown-user-name">${user.name}</div>
                <div class="dropdown-user-email">${user.email}</div>
              </div>
              <div class="dropdown-divider"></div>
              <a href="cart.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <span>Giỏ hàng & Đơn hàng</span>
              </a>
              <button type="button" class="dropdown-item logout" onclick="AuthService.logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <button class="btn btn-secondary btn-sm" onclick="AuthService.openModal('login')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Đăng nhập</span>
          </button>
        `;
      }
    });

    // Cập nhật nhãn bottom nav
    const bottomAccountText = document.getElementById('bottom-nav-account-text');
    if (bottomAccountText) {
      bottomAccountText.textContent = user ? user.name.split(' ').pop() : 'Tài khoản';
    }
  },

  createAuthModalHTML() {
    const div = document.createElement('div');
    div.id = 'auth-modal';
    div.className = 'modal-overlay';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.innerHTML = `
      <div class="modal-dialog auth-dialog">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <div class="brand-logo" style="font-size: 1.25rem;">
            <div class="logo-badge" style="width: 32px; height: 32px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <span class="brand-name">Trend<span>Mart</span></span>
          </div>
          <button type="button" class="btn-icon" onclick="AuthService.closeModal()" style="color: var(--text-muted);" aria-label="Đóng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="auth-tab-btn-login" onclick="AuthService.switchTab('login')">Đăng Nhập</button>
          <button class="auth-tab-btn" id="auth-tab-btn-register" onclick="AuthService.switchTab('register')">Đăng Ký</button>
        </div>

        <!-- Form Đăng Nhập -->
        <form id="auth-form-login">
          <div class="form-group">
            <label class="form-label" for="login-email">Email hoặc Số điện thoại</label>
            <input type="text" id="login-email" class="form-input" placeholder="demo@trendmart.vn hoặc 0912345678" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Mật khẩu</label>
            <input type="password" id="login-password" class="form-input" placeholder="Mật khẩu của bạn" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 1rem;">Đăng Nhập</button>

          <div class="auth-social-hint">
            Tài khoản dùng thử sẵn: <code>demo@trendmart.vn</code> / pass: <code>123</code>
          </div>
        </form>

        <!-- Form Đăng Ký -->
        <form id="auth-form-register" style="display: none;">
          <div class="form-group">
            <label class="form-label" for="reg-name">Họ và tên của bạn</label>
            <input type="text" id="reg-name" class="form-input" placeholder="Ví dụ: Trần Thị Mai" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Địa chỉ Email</label>
            <input type="email" id="reg-email" class="form-input" placeholder="mail@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-phone">Số điện thoại</label>
            <input type="tel" id="reg-phone" class="form-input" placeholder="0987654321" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-password">Mật khẩu</label>
            <input type="password" id="reg-password" class="form-input" placeholder="Tối thiểu 6 ký tự" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 1rem;">Tạo Tài Khoản</button>
        </form>
      </div>
    `;
    document.body.appendChild(div);
  },

  bindAuthModal() {
    this.createAuthModalHTML();

    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'auth-form-login') {
        e.preventDefault();
        const id = document.getElementById('login-email')?.value || '';
        const pass = document.getElementById('login-password')?.value || '';
        this.login(id, pass);
      }
      if (e.target && e.target.id === 'auth-form-register') {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value || '';
        const email = document.getElementById('reg-email')?.value || '';
        const phone = document.getElementById('reg-phone')?.value || '';
        const pass = document.getElementById('reg-password')?.value || '';
        this.register(name, email, phone, pass);
      }
    });

    // Đóng dropdown khi click ngoài
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-profile-menu')) {
        document.querySelectorAll('.user-profile-menu.open').forEach(el => el.classList.remove('open'));
      }
    });

    // Phím ESC đóng modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }
};

// ==========================================
// 7. KHỞI TẠO CHUNG KHI TẢI TRANG
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo Theme Sáng/Tối
  ThemeService.init();

  // Khởi tạo Hệ thống Auth
  AuthService.init();

  // Cập nhật số lượng giỏ hàng trên Header ngay khi tải trang
  CartService.updateCartBadge();

  // Khởi tạo Countdown Deal (nếu có phần tử trên trang)
  initCountdown();

  // Xử lý Mobile Navigation Drawer
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');

  function openMobileNav() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileBtn) mobileBtn.addEventListener('click', openMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileNav);

  // Xử lý form newsletter ở Footer
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      if (input && input.value.trim()) {
        showToast('Cảm ơn bạn! 🎉', 'Bạn đã đăng ký nhận bản tin khuyến mãi thành công.', 'success');
        input.value = '';
      }
    });
  }
});
