/**
 * TrendMart - Smart Shopping Cart & Multi-channel Checkout Engine
 * Xử lý: Tăng giảm số lượng, tính toán tức thì thuế VAT, freeship progress, coupon, validate form
 */

(function() {
  'use strict';

  const CONFIG = {
    FREE_SHIPPING_THRESHOLD: 1000000, // 1.000.000₫
    DEFAULT_SHIPPING_FEE: 30000,      // 30.000₫
    VAT_RATE: 0.08,                   // 8% VAT
    COUPONS: {
      'FIRST15': { discountPercent: 15, desc: 'Giảm 15% đơn hàng đầu tiên' },
      'TRENDMART': { discountPercent: 10, desc: 'Giảm 10% tri ân khách hàng' }
    }
  };

  const state = {
    appliedCoupon: null,
    paymentMethod: 'cod'
  };

  const DOM = {
    cartList: document.getElementById('cart-items-list'),
    cartCountTitle: document.getElementById('cart-item-count-title'),
    cartEmptyView: document.getElementById('cart-empty-view'),
    clearEntireCartBtn: document.getElementById('btn-clear-entire-cart'),
    // Freeship Progress
    shippingMsgText: document.getElementById('shipping-msg-text'),
    shippingProgressFill: document.getElementById('shipping-progress-fill'),
    // Summary
    summarySubtotal: document.getElementById('summary-subtotal'),
    rowDiscount: document.getElementById('row-discount'),
    summaryDiscount: document.getElementById('summary-discount'),
    summaryShipping: document.getElementById('summary-shipping'),
    summaryVat: document.getElementById('summary-vat'),
    summaryTotal: document.getElementById('summary-total'),
    // Coupon Form
    couponForm: document.getElementById('coupon-form'),
    couponInput: document.getElementById('coupon-code-input'),
    appliedCouponPill: document.getElementById('applied-coupon-pill'),
    appliedCouponCode: document.getElementById('applied-coupon-code'),
    removeCouponBtn: document.getElementById('btn-remove-coupon'),
    // Checkout Form
    checkoutForm: document.getElementById('checkout-form'),
    inputFullname: document.getElementById('checkout-fullname'),
    inputPhone: document.getElementById('checkout-phone'),
    inputEmail: document.getElementById('checkout-email'),
    inputAddress: document.getElementById('checkout-address'),
    inputNote: document.getElementById('checkout-note'),
    paymentCards: document.querySelectorAll('.payment-method-card'),
    // Payment Details Boxes
    detailCod: document.getElementById('detail-cod-box'),
    detailVietqr: document.getElementById('detail-vietqr-box'),
    detailEwallet: document.getElementById('detail-ewallet-box'),
    detailCard: document.getElementById('detail-card-box'),
    // Modal
    modal: document.getElementById('order-success-modal'),
    receiptOrderId: document.getElementById('receipt-order-id'),
    receiptCustomerName: document.getElementById('receipt-customer-name'),
    receiptCustomerPhone: document.getElementById('receipt-customer-phone'),
    receiptCustomerAddress: document.getElementById('receipt-customer-address'),
    receiptPaymentMethod: document.getElementById('receipt-payment-method'),
    receiptTotalAmount: document.getElementById('receipt-total-amount')
  };

  /**
   * Tính toán toàn bộ các chỉ số giỏ hàng
   */
  function calculateTotals() {
    const cart = CartService.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Tính giảm giá coupon
    let discountAmount = 0;
    if (state.appliedCoupon && CONFIG.COUPONS[state.appliedCoupon]) {
      const rate = CONFIG.COUPONS[state.appliedCoupon].discountPercent / 100;
      discountAmount = Math.round(subtotal * rate);
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // Tính phí vận chuyển (Freeship nếu >= 1.000.000₫ hoặc nếu giỏ rỗng)
    let shippingFee = CONFIG.DEFAULT_SHIPPING_FEE;
    const isFreeShipping = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;

    if (cart.length === 0 || isFreeShipping) {
      shippingFee = 0;
    }

    // Tính thuế VAT (8% tính trên tạm tính sau giảm giá)
    const vat = cart.length === 0 ? 0 : Math.round(discountedSubtotal * CONFIG.VAT_RATE);

    // Tổng thanh toán cuối cùng
    const total = cart.length === 0 ? 0 : (discountedSubtotal + vat + shippingFee);

    return {
      subtotal,
      totalItemsCount,
      discountAmount,
      isFreeShipping,
      shippingFee,
      vat,
      total
    };
  }

  /**
   * Cập nhật thanh tiến trình Freeship thông minh
   */
  function updateFreeShippingBar(subtotal) {
    if (!DOM.shippingMsgText || !DOM.shippingProgressFill) return;

    if (subtotal === 0) {
      DOM.shippingMsgText.innerHTML = `Thêm sản phẩm vào giỏ để nhận ưu đãi <strong>MIỄN PHÍ VẬN CHUYỂN</strong>`;
      DOM.shippingProgressFill.style.width = '0%';
      DOM.shippingProgressFill.classList.remove('complete');
      return;
    }

    if (subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD) {
      DOM.shippingMsgText.innerHTML = `🎉 Tuyệt vời! Bạn đã được <strong>MIỄN PHÍ VẬN CHUYỂN</strong> toàn quốc.`;
      DOM.shippingProgressFill.style.width = '100%';
      DOM.shippingProgressFill.classList.add('complete');
    } else {
      const remaining = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
      const percent = Math.min(100, Math.round((subtotal / CONFIG.FREE_SHIPPING_THRESHOLD) * 100));
      DOM.shippingMsgText.innerHTML = `Mua thêm <strong>${formatVND(remaining)}</strong> để được <strong>FREESHIP</strong> toàn quốc!`;
      DOM.shippingProgressFill.style.width = `${percent}%`;
      DOM.shippingProgressFill.classList.remove('complete');
    }
  }

  /**
   * Cập nhật tóm tắt thanh toán (Summary)
   */
  function updateSummaryDisplay(totals) {
    if (DOM.summarySubtotal) DOM.summarySubtotal.textContent = formatVND(totals.subtotal);

    // Dòng voucher
    if (DOM.rowDiscount && DOM.summaryDiscount) {
      if (totals.discountAmount > 0) {
        DOM.rowDiscount.style.display = 'flex';
        DOM.summaryDiscount.textContent = `-${formatVND(totals.discountAmount)}`;
      } else {
        DOM.rowDiscount.style.display = 'none';
      }
    }

    // Phí ship
    if (DOM.summaryShipping) {
      if (totals.subtotal === 0) {
        DOM.summaryShipping.textContent = '0₫';
        DOM.summaryShipping.style.color = 'var(--text-secondary)';
      } else if (totals.isFreeShipping) {
        DOM.summaryShipping.textContent = 'Miễn phí';
        DOM.summaryShipping.style.color = 'var(--success)';
      } else {
        DOM.summaryShipping.textContent = formatVND(CONFIG.DEFAULT_SHIPPING_FEE);
        DOM.summaryShipping.style.color = 'var(--text-main)';
      }
    }

    // Thuế VAT & Tổng cộng
    if (DOM.summaryVat) DOM.summaryVat.textContent = formatVND(totals.vat);
    if (DOM.summaryTotal) DOM.summaryTotal.textContent = formatVND(totals.total);
  }

  /**
   * Render danh sách sản phẩm trong giỏ hàng
   */
  function renderCart() {
    const cart = CartService.getCart();
    const totals = calculateTotals();

    // Cập nhật tiêu đề số lượng
    if (DOM.cartCountTitle) {
      DOM.cartCountTitle.textContent = `Sản phẩm trong giỏ (${totals.totalItemsCount})`;
    }

    // Kiểm tra trạng thái rỗng
    if (cart.length === 0) {
      if (DOM.cartList) DOM.cartList.innerHTML = '';
      if (DOM.cartEmptyView) DOM.cartEmptyView.style.display = 'flex';
      if (DOM.clearEntireCartBtn) DOM.clearEntireCartBtn.style.display = 'none';
      updateFreeShippingBar(0);
      updateSummaryDisplay(totals);
      return;
    }

    if (DOM.cartEmptyView) DOM.cartEmptyView.style.display = 'none';
    if (DOM.clearEntireCartBtn) DOM.clearEntireCartBtn.style.display = 'inline-flex';

    // Tạo HTML cho từng dòng sản phẩm
    if (DOM.cartList) {
      DOM.cartList.innerHTML = cart.map(item => {
        const itemSubtotal = item.price * item.quantity;
        return `
          <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-item-img">
              <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='${window.TrendMartData?.fallbackImage}';">
            </div>

            <div class="cart-item-info">
              <span class="cart-item-cat">${item.categoryName || 'Sản phẩm'}</span>
              <h4 class="cart-item-title">${item.name}</h4>
              <span class="cart-item-unit-price">Đơn giá: ${formatVND(item.price)}</span>
            </div>

            <div class="cart-item-controls-wrap">
              <div class="qty-control">
                <button class="qty-btn" onclick="window.CartApp.changeQuantity(${item.id}, ${item.quantity - 1})" aria-label="Giảm số lượng">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="window.CartApp.changeQuantity(${item.id}, ${item.quantity + 1})" aria-label="Tăng số lượng">+</button>
              </div>

              <div class="cart-item-total">
                ${formatVND(itemSubtotal)}
              </div>
            </div>

            <button class="cart-item-delete" onclick="CartService.removeItem(${item.id})" title="Xóa khỏi giỏ" aria-label="Xóa sản phẩm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        `;
      }).join('');
    }

    updateFreeShippingBar(totals.subtotal);
    updateSummaryDisplay(totals);
  }

  /**
   * Thay đổi số lượng sản phẩm (bảo vệ giới hạn tồn kho)
   */
  function changeQuantity(productId, newQty) {
    CartService.updateQuantity(productId, newQty);
    renderCart();
  }

  /**
   * Áp dụng mã Voucher
   */
  function applyCoupon(code) {
    const formattedCode = (code || '').trim().toUpperCase();
    if (!formattedCode) {
      showToast('Vui lòng nhập mã', 'Hãy nhập mã voucher giảm giá vào ô', 'warning');
      return;
    }

    if (CONFIG.COUPONS[formattedCode]) {
      state.appliedCoupon = formattedCode;
      if (DOM.appliedCouponCode) DOM.appliedCouponCode.textContent = formattedCode;
      if (DOM.appliedCouponPill) DOM.appliedCouponPill.style.display = 'flex';
      if (DOM.couponInput) DOM.couponInput.value = '';
      showToast('Áp dụng thành công! 🎉', CONFIG.COUPONS[formattedCode].desc, 'success');
      renderCart();
    } else {
      showToast('Mã không hợp lệ', 'Mã voucher này không tồn tại hoặc đã hết hạn', 'danger');
    }
  }

  /**
   * Hủy mã Voucher
   */
  function removeCoupon() {
    state.appliedCoupon = null;
    if (DOM.appliedCouponPill) DOM.appliedCouponPill.style.display = 'none';
    showToast('Đã hủy mã voucher', 'Giá giỏ hàng đã được tính lại', 'info');
    renderCart();
  }

  /**
   * Xử lý chuyển đổi phương thức thanh toán
   */
  function setupPaymentMethods() {
    DOM.paymentCards.forEach(card => {
      card.addEventListener('click', () => {
        DOM.paymentCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        const method = card.getAttribute('data-method');
        state.paymentMethod = method;

        // Ẩn/hiện chi tiết thanh toán động
        if (DOM.detailCod) DOM.detailCod.style.display = method === 'cod' ? 'block' : 'none';
        if (DOM.detailVietqr) DOM.detailVietqr.style.display = method === 'vietqr' ? 'block' : 'none';
        if (DOM.detailEwallet) DOM.detailEwallet.style.display = method === 'ewallet' ? 'block' : 'none';
        if (DOM.detailCard) DOM.detailCard.style.display = method === 'card' ? 'block' : 'none';
      });
    });
  }

  /**
   * Kiểm tra tính hợp lệ của Form đặt hàng (Validation)
   */
  function validateCheckoutForm() {
    let isValid = true;

    // 1. Kiểm tra Họ và tên
    const nameVal = DOM.inputFullname?.value.trim() || '';
    const groupName = document.getElementById('group-fullname');
    if (nameVal.length < 3) {
      if (groupName) groupName.classList.add('has-error');
      isValid = false;
    } else {
      if (groupName) groupName.classList.remove('has-error');
    }

    // 2. Kiểm tra Số điện thoại (chuẩn regex Việt Nam)
    const phoneVal = DOM.inputPhone?.value.trim() || '';
    const groupPhone = document.getElementById('group-phone');
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phoneVal)) {
      if (groupPhone) groupPhone.classList.add('has-error');
      isValid = false;
    } else {
      if (groupPhone) groupPhone.classList.remove('has-error');
    }

    // 3. Kiểm tra Email
    const emailVal = DOM.inputEmail?.value.trim() || '';
    const groupEmail = document.getElementById('group-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      if (groupEmail) groupEmail.classList.add('has-error');
      isValid = false;
    } else {
      if (groupEmail) groupEmail.classList.remove('has-error');
    }

    // 4. Kiểm tra Địa chỉ
    const addressVal = DOM.inputAddress?.value.trim() || '';
    const groupAddress = document.getElementById('group-address');
    if (addressVal.length < 6) {
      if (groupAddress) groupAddress.classList.add('has-error');
      isValid = false;
    } else {
      if (groupAddress) groupAddress.classList.remove('has-error');
    }

    return isValid;
  }

  /**
   * Xử lý xác nhận đặt hàng thành công
   */
  function handleOrderSubmission(e) {
    e.preventDefault();

    const cart = CartService.getCart();
    if (cart.length === 0) {
      showToast('Giỏ hàng trống!', 'Vui lòng chọn mua ít nhất 1 sản phẩm trước khi đặt hàng.', 'warning');
      return;
    }

    if (!validateCheckoutForm()) {
      showToast('Thông tin chưa đủ', 'Vui lòng kiểm tra lại các trường thông tin có viền đỏ.', 'danger');
      return;
    }

    const totals = calculateTotals();
    const orderId = '#TM-' + Math.floor(10000 + Math.random() * 90000);

    // Map tên phương thức thanh toán
    const methodNames = {
      cod: 'Tiền mặt khi nhận hàng (COD)',
      vietqr: 'Chuyển khoản VietQR 24/7',
      ewallet: 'Ví điện tử MoMo / ZaloPay',
      card: 'Thẻ quốc tế Visa / Mastercard'
    };

    // Điền dữ liệu vào Modal xác nhận
    if (DOM.receiptOrderId) DOM.receiptOrderId.textContent = orderId;
    if (DOM.receiptCustomerName) DOM.receiptCustomerName.textContent = DOM.inputFullname.value.trim();
    if (DOM.receiptCustomerPhone) DOM.receiptCustomerPhone.textContent = DOM.inputPhone.value.trim();
    if (DOM.receiptCustomerAddress) DOM.receiptCustomerAddress.textContent = DOM.inputAddress.value.trim();
    if (DOM.receiptPaymentMethod) DOM.receiptPaymentMethod.textContent = methodNames[state.paymentMethod] || 'COD';
    if (DOM.receiptTotalAmount) DOM.receiptTotalAmount.textContent = formatVND(totals.total);

    // Hiển thị modal
    if (DOM.modal) {
      DOM.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Xóa giỏ hàng và reset coupon
    CartService.clearCart();
    state.appliedCoupon = null;
    if (DOM.appliedCouponPill) DOM.appliedCouponPill.style.display = 'none';

    // Cập nhật lại giao diện
    renderCart();
  }

  /**
   * Lắng nghe sự kiện
   */
  function bindEvents() {
    // 1. Áp dụng mã giảm giá
    if (DOM.couponForm) {
      DOM.couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyCoupon(DOM.couponInput?.value);
      });
    }

    // 2. Xóa mã giảm giá
    if (DOM.removeCouponBtn) {
      DOM.removeCouponBtn.addEventListener('click', removeCoupon);
    }

    // 3. Xóa toàn bộ giỏ hàng
    if (DOM.clearEntireCartBtn) {
      DOM.clearEntireCartBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng không?')) {
          CartService.clearCart();
          renderCart();
          showToast('Đã làm trống giỏ hàng', '', 'info');
        }
      });
    }

    // 4. Form đặt hàng
    if (DOM.checkoutForm) {
      DOM.checkoutForm.addEventListener('submit', handleOrderSubmission);
    }

    // 5. Lắng nghe sự kiện giỏ hàng thay đổi từ các tab hoặc cửa sổ khác
    window.addEventListener('cartChanged', renderCart);
  }

  /**
   * Tự động điền thông tin người dùng nếu đã đăng nhập
   */
  function autoFillCheckoutUser() {
    const user = AuthService?.getLoggedUser ? AuthService.getLoggedUser() : null;
    if (user) {
      if (DOM.inputFullname && !DOM.inputFullname.value) DOM.inputFullname.value = user.name || '';
      if (DOM.inputPhone && !DOM.inputPhone.value) DOM.inputPhone.value = user.phone || '';
      if (DOM.inputEmail && !DOM.inputEmail.value) DOM.inputEmail.value = user.email || '';
    }
  }

  // Khởi động
  document.addEventListener('DOMContentLoaded', () => {
    setupPaymentMethods();
    bindEvents();
    renderCart();
    autoFillCheckoutUser();
  });

  // Export các hàm điều khiển ra toàn cục
  window.CartApp = {
    changeQuantity,
    applyCoupon,
    removeCoupon
  };
  window.autoFillCheckoutUser = autoFillCheckoutUser;

})();
