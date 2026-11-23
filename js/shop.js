/**
 * TrendMart - Shop Catalog & Interactive Filter Engine
 * Lọc đa tiêu chí: danh mục, khoảng giá, trạng thái nhãn, tìm kiếm tức thì, sắp xếp
 */

(function() {
  'use strict';

  const state = {
    category: 'all',
    maxPrice: 3500000,
    badge: 'all',
    searchQuery: '',
    sortBy: 'featured'
  };

  const DOM = {
    grid: document.getElementById('shop-products-grid'),
    countSummary: document.getElementById('product-count-summary'),
    emptyState: document.getElementById('shop-empty-state'),
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    priceSlider: document.getElementById('price-range-slider'),
    priceDisplay: document.getElementById('price-slider-display'),
    pricePresets: document.querySelectorAll('.price-preset-pill'),
    categoryRadios: document.querySelectorAll('input[name="filter-category"]'),
    badgeRadios: document.querySelectorAll('input[name="filter-badge"]'),
    clearFiltersBtn: document.getElementById('btn-clear-filters'),
    // Mobile Drawer
    filterSidebar: document.getElementById('filter-sidebar'),
    openMobileFilterBtn: document.getElementById('btn-open-mobile-filter'),
    applyMobileFilterBtn: document.getElementById('btn-apply-mobile-filter'),
    mobileFilterCloseWrap: document.getElementById('mobile-filter-close-wrap')
  };

  /**
   * Khởi tạo bộ lọc ban đầu từ URL Query Parameters
   * Ví dụ: shop.html?category=fashion-women hoặc shop.html?badge=sale hoặc shop.html?search=tai%20nghe
   */
  function initFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Category param
    const categoryParam = params.get('category');
    if (categoryParam) {
      state.category = categoryParam;
      const targetRadio = document.querySelector(`input[name="filter-category"][value="${categoryParam}"]`);
      if (targetRadio) targetRadio.checked = true;
    }

    // Badge param
    const badgeParam = params.get('badge');
    if (badgeParam) {
      state.badge = badgeParam;
      const targetRadio = document.querySelector(`input[name="filter-badge"][value="${badgeParam}"]`);
      if (targetRadio) targetRadio.checked = true;
    }

    // Search param
    const searchParam = params.get('search');
    if (searchParam) {
      state.searchQuery = searchParam.trim();
      if (DOM.searchInput) DOM.searchInput.value = searchParam.trim();
    }
  }

  /**
   * Lọc và sắp xếp danh sách sản phẩm
   */
  function getFilteredProducts() {
    const allProducts = window.TrendMartData?.products || [];

    return allProducts.filter(product => {
      // 1. Lọc theo Danh mục
      if (state.category !== 'all' && product.category !== state.category) {
        return false;
      }

      // 2. Lọc theo Mức giá tối đa
      if (product.price > state.maxPrice) {
        return false;
      }

      // 3. Lọc theo Trạng thái nhãn (Badge)
      if (state.badge !== 'all') {
        if (product.badgeType !== state.badge) {
          return false;
        }
      }

      // 4. Lọc theo Từ khóa tìm kiếm
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(query);
        const catMatch = product.categoryName.toLowerCase().includes(query);
        const descMatch = (product.description || '').toLowerCase().includes(query);
        if (!nameMatch && !catMatch && !descMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 5. Sắp xếp kết quả
      switch (state.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'discount-desc':
          return (b.discount || 0) - (a.discount || 0);
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }

  /**
   * Render danh sách sản phẩm lên giao diện
   */
  function renderProducts() {
    if (!DOM.grid) return;

    const filtered = getFilteredProducts();
    const totalCount = window.TrendMartData?.products.length || 0;

    // Cập nhật dòng tóm tắt số lượng
    if (DOM.countSummary) {
      DOM.countSummary.innerHTML = `Hiển thị <strong>${filtered.length}</strong> / ${totalCount} sản phẩm`;
    }

    if (filtered.length === 0) {
      DOM.grid.style.display = 'none';
      if (DOM.emptyState) DOM.emptyState.style.display = 'flex';
      return;
    }

    DOM.grid.style.display = 'grid';
    if (DOM.emptyState) DOM.emptyState.style.display = 'none';

    DOM.grid.innerHTML = filtered.map(product => renderProductCardHTML(product)).join('');
  }

  /**
   * Reset toàn bộ các bộ lọc về trạng thái ban đầu
   */
  function resetFilters() {
    state.category = 'all';
    state.maxPrice = 3500000;
    state.badge = 'all';
    state.searchQuery = '';
    state.sortBy = 'featured';

    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.sortSelect) DOM.sortSelect.value = 'featured';
    if (DOM.priceSlider) DOM.priceSlider.value = '3500000';
    if (DOM.priceDisplay) DOM.priceDisplay.textContent = 'Tất cả';

    const defaultCatRadio = document.querySelector('input[name="filter-category"][value="all"]');
    if (defaultCatRadio) defaultCatRadio.checked = true;

    const defaultBadgeRadio = document.querySelector('input[name="filter-badge"][value="all"]');
    if (defaultBadgeRadio) defaultBadgeRadio.checked = true;

    DOM.pricePresets.forEach(preset => {
      preset.classList.toggle('active', preset.getAttribute('data-max') === '3500000');
    });

    // Cập nhật lại URL không reload
    window.history.replaceState({}, '', window.location.pathname);

    renderProducts();
    showToast('Đã xóa bộ lọc', 'Hiển thị toàn bộ danh sách sản phẩm', 'info');
  }

  /**
   * Gắn các sự kiện lắng nghe tương tác người dùng
   */
  function bindEvents() {
    // 1. Tìm kiếm (Search Input với xử lý tức thì)
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderProducts();
      });
    }

    // 2. Sắp xếp (Sort Dropdown)
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderProducts();
      });
    }

    // 3. Lọc theo Danh mục (Radio buttons)
    DOM.categoryRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.category = e.target.value;
          renderProducts();
        }
      });
    });

    // 4. Lọc theo Badge (Radio buttons)
    DOM.badgeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.badge = e.target.value;
          renderProducts();
        }
      });
    });

    // 5. Thanh trượt mức giá (Price Range Slider)
    if (DOM.priceSlider) {
      DOM.priceSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        state.maxPrice = val;
        if (DOM.priceDisplay) {
          DOM.priceDisplay.textContent = val >= 3500000 ? 'Tất cả' : `Dưới ${formatVND(val)}`;
        }

        // Tắt active của các preset pills
        DOM.pricePresets.forEach(btn => btn.classList.remove('active'));

        renderProducts();
      });
    }

    // 6. Các nút mức giá chọn nhanh (Preset Pills)
    DOM.pricePresets.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.pricePresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const maxVal = Number(btn.getAttribute('data-max'));
        state.maxPrice = maxVal;
        if (DOM.priceSlider) DOM.priceSlider.value = maxVal;
        if (DOM.priceDisplay) {
          DOM.priceDisplay.textContent = maxVal >= 3500000 ? 'Tất cả' : `Dưới ${formatVND(maxVal)}`;
        }
        renderProducts();
      });
    });

    // 7. Nút Xóa bộ lọc
    if (DOM.clearFiltersBtn) {
      DOM.clearFiltersBtn.addEventListener('click', resetFilters);
    }

    // 8. Mobile Filter Sidebar Drawer
    if (DOM.openMobileFilterBtn && DOM.filterSidebar) {
      DOM.openMobileFilterBtn.addEventListener('click', () => {
        DOM.filterSidebar.classList.add('open');
        if (DOM.mobileFilterCloseWrap) DOM.mobileFilterCloseWrap.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    }

    if (DOM.applyMobileFilterBtn && DOM.filterSidebar) {
      DOM.applyMobileFilterBtn.addEventListener('click', () => {
        DOM.filterSidebar.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  }

  // Khởi động khi tải trang
  document.addEventListener('DOMContentLoaded', () => {
    initFiltersFromURL();
    bindEvents();
    renderProducts();
  });

  // Export helper để dùng từ empty state button
  window.ShopApp = {
    resetFilters: resetFilters
  };

})();
