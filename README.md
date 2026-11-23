# 🛍️ TrendMart - Hệ Thống Mua Sắm & Giỏ Hàng Thông Minh (Smart Shopping Cart)

> **Học phần:** Thiết Kế & Phát Triển Ứng Dụng Web Thương Mại Điện Tử  
> **Phân hệ thực hiện:** 2.2.1 - Smart Shopping Cart & Product Catalog  
> **Công nghệ:** 100% Thuần HTML5, CSS3 & Vanilla JavaScript (ES6+) — *Zero Dependencies (Không phụ thuộc Framework ngoài)*  
> **Sinh viên thực hiện:
** Lê Nhật Duy (MSSV: `125000335` - Lớp: `25CT111`)
** Mai Huy Phong (MSSV: `125000312` - Lớp: `25CT111`)
** Nguyễn Nhật Bảo Lâm (MSSV: `125000777` - Lớp: `25CT111`)
** Vũ Minh Tiến (MSSV: `125000764` - Lớp: `25CT111`)

---

## 📌 1. Giới Thiệu Tổng Quan

**TrendMart** là ứng dụng web thương mại điện tử hiện đại, tập trung mang lại trải nghiệm mua sắm trực tuyến mượt mà, trực quan và thông minh. Ứng dụng mô phỏng hoàn chỉnh quy trình mua sắm thực tế từ khám phá sản phẩm, tìm kiếm - lọc theo nhu cầu, thêm vào giỏ hàng tức thì, áp dụng voucher khuyến mãi, cho đến thanh toán đa kênh tiện lợi.

Dự án được xây dựng tuân thủ nghiêm ngặt chuẩn kiến trúc web hiện đại:
- **Zero-Dependency:** 100% mã nguồn viết bằng HTML5 ngữ nghĩa, CSS3 hiện đại và ES6+ JavaScript, chạy mượt mà trên mọi trình duyệt mà không cần cài đặt môi trường Build, Node.js hay thư viện ngoài.
- **Design System cao cấp:** Thiết kế theo phong cách hiện đại với font chữ *Plus Jakarta Sans*, bảng màu hài hòa, đổ bóng khuếch tán và hiệu ứng chuyển động vi mô (micro-interactions) tinh tế.
- **Mobile-First & PWA-like UX:** Tích hợp thanh điều hướng cố định dưới đáy màn hình (Mobile Bottom Navigation) tương tự các sàn TMĐT hàng đầu (Shopee, Lazada).

---

## 🌟 2. Các Tính Năng Nổi Bật (Key Features)

### 🌓 2.1. Chế Độ Sáng / Tối (Dark & Light Theme)
- Chuyển đổi giao diện linh hoạt giữa chế độ **Sáng (Light Mode)** và **Tối (Dark Mode)** chỉ với một cú click.
- Tự động nhận diện thiết lập giao diện hệ thống của người dùng (`prefers-color-scheme`).
- Toàn bộ giao diện Dark Mode sử dụng tông màu Slate Navy sâu (`#0B0F19`, `#1E293B`) kết hợp màu tím Violet thương hiệu (`#8B5CF6`), bảo vệ thị giác người dùng khi lướt web ban đêm và đạt chuẩn tương phản trợ năng **WCAG AA**.
- Lưu trạng thái vào `localStorage` (`trendmart_theme_v1`), giữ nguyên chế độ khi chuyển đổi giữa các trang hoặc tải lại trang.

### 🛒 2.2. Giỏ Hàng Thông Minh & Phản Hồi Tức Thì (Smart Shopping Cart)
- **Thêm sản phẩm tức thì (Zero-Reload):** Thêm hàng vào giỏ từ Trang chủ, Trang Cửa hàng mà không làm gián đoạn trải nghiệm của người mua.
- **Tăng / Giảm số lượng thông minh:** Nút điều chỉnh `[-]` và `[+]` kèm cơ chế kiểm tra giới hạn tồn kho (**Stock Boundary Checking**). Khi chạm trần kho hàng, hệ thống tự động khóa nút và hiển thị cảnh báo thân thiện.
- **Thanh Freeship thông minh (Dynamic Freeship Progress Bar):**
  - Mốc miễn phí giao hàng: **1.000.000₫**.
  - Thanh tiến trình co giãn thời gian thực thông báo chính xác số tiền cần mua thêm để được Freeship.
  - Khi tổng tiền hàng $\ge$ 1.000.000₫, phí vận chuyển tự động chuyển về **0₫** kèm huy hiệu *"Đã đạt điều kiện Freeship"*.
- **Tự động hạch toán chi phí:** Tính toán tức thì Phí vận chuyển tiêu chuẩn (30.000₫), Thuế giá trị gia tăng **VAT (8%)**, Khấu trừ voucher và Tổng tiền thanh toán.

### 🎟️ 2.3. Động Cơ Mã Khuyến Mãi (Coupon Engine)
- Tích hợp sẵn các mã voucher giảm giá:
  - `FIRST15`: Giảm **15%** giá trị đơn hàng (dành cho đơn đầu tiên).
  - `TRENDMART`: Giảm **10%** tri ân khách hàng thân thiết.
- Tính năng **Sao chép mã 1 chạm (Click-to-Copy)** ngay tại banner hoặc giỏ hàng.
- Kiểm tra tính hợp lệ của mã, ngăn chặn áp dụng trùng lặp và trừ trực tiếp vào tổng bill.

### 💳 2.4. Thanh Toán Đa Kênh & Xác Nhận Đơn Hàng (Multi-channel Checkout)
- Hỗ trợ 4 hình thức thanh toán phổ biến tại Việt Nam:
  1. **COD:** Thanh toán tiền mặt khi nhận hàng.
  2. **Chuyển khoản VietQR:** Hiển thị tự động mã QR động, tên ngân hàng, số tài khoản và cú pháp chuyển khoản tương ứng với số tiền đơn hàng.
  3. **Ví điện tử:** Hỗ trợ quét mã thanh toán qua MoMo / ZaloPay.
  4. **Thẻ quốc tế:** Hỗ trợ thẻ tín dụng / ghi nợ (Visa, MasterCard).
- **Form Validation hoàn chỉnh:** Bắt buộc nhập đầy đủ Họ tên, Số điện thoại (chuẩn 10 chữ số), Email hợp lệ và Địa chỉ giao hàng.
- **Modal Chúc mừng Đặt hàng Thành công:** Hiển thị biên lai tóm tắt gồm Mã đơn hàng tự sinh ngẫu nhiên (`#TM-XXXXX`), ngày đặt, phương thức thanh toán và số tiền cuối cùng.

### 🔍 2.5. Trang Cửa Hàng & Bộ Lọc Đa Tiêu Chí (Shop Catalog & Filters)
- **Bộ lọc danh mục (Categories):** Lọc theo Thời trang Nam, Thời trang Nữ, Công nghệ, Làm đẹp & Mỹ phẩm, Gia dụng.
- **Thanh trượt giá thông minh (Price Range Slider):** Kéo lọc giá từ 200.000₫ đến 3.500.000₫ kèm các nút chọn nhanh (`< 500k`, `< 1 triệu`, `< 2 triệu`).
- **Lọc theo trạng thái:** Sản phẩm Hot, Giảm giá (Sale), Hàng mới về (New).
- **Tìm kiếm thời gian thực (Live Search):** Gõ từ khóa tìm kiếm theo tên hoặc mô tả sản phẩm cho kết quả tức thì.
- **Sắp xếp linh hoạt:** Theo giá tăng dần, giảm dần, đánh giá sao hoặc mức ưu đãi %.
- **Đồng bộ URL Params:** Hỗ trợ điều hướng bằng link (Ví dụ: `shop.html?category=tech` hoặc `shop.html?badge=sale`).

### 👤 2.6. Hệ Thống Tài Khoản (Authentication Simulation)
- Modal Đăng nhập / Đăng ký chuyển tab mượt mà.
- Kiểm tra hợp lệ dữ liệu đăng ký và lưu cơ sở dữ liệu người dùng mô phỏng vào `localStorage`.
- **Tài khoản Demo dựng sẵn:**  
  - Email: `demo@trendmart.vn`  
  - Mật khẩu: `123`
- Khi đã đăng nhập: Header hiển thị Avatar định danh, dropdown menu quản lý tài khoản và tự động điền (Auto-fill) thông tin người mua khi thanh toán.

## 📁 3. Cấu Trúc Thư Mục Dự Án

```text
dự án/
├── index.html                             # Trang chủ (Hero banner, Best sellers, Flash sale, AI picks)
├── shop.html                              # Trang Cửa hàng & Bộ lọc đa tiêu chí
├── cart.html                              # Trang Giỏ hàng thông minh & Thanh toán đa kênh
├── TrendMart_Smart_Shopping_Cart_BaoCao.pptx # Báo cáo trình chiếu thuyết trình 10 slides
├── README.md                              # Tài liệu hướng dẫn dự án chi tiết
│
├── css/
│   └── style.css                          # Toàn bộ CSS (Variables, Dark mode, Grid, Typography, Components)
│
├── js/
│   ├── data.js                            # Mock Database: 16 sản phẩm đa dạng, danh mục, banner, tags
│   ├── main.js                            # Global Core: Auth, Theme, Wishlist, Toast, Cart Service
│   ├── shop.js                            # Shop Engine: Bộ lọc đa tiêu chí, tìm kiếm, sắp xếp, sync URL
│   └── cart.js                            # Cart Engine: Smart cart, Freeship bar, Voucher, Checkout form
│
└── screenshots/                           # Ảnh chụp minh chứng giao diện thực tế
    ├── 01_home_light.png                  # Trang chủ - Chế độ Sáng
    ├── 02_home_dark.png                   # Trang chủ - Chế độ Tối
    ├── 03_auth_modal.png                  # Modal Đăng nhập & Đăng ký
    ├── 04_shop_catalog.png                # Trang Cửa hàng & Bộ lọc sản phẩm
    ├── 05_smart_cart.png                  # Giỏ hàng thông minh & Cổng thanh toán
    └── 06_mobile_view.png                 # Giao diện trên thiết bị di động
```

---

## 💾 4. Kiến Trúc Lưu Trữ Dữ Liệu (LocalStorage Engine)

Ứng dụng sử dụng cơ chế lưu trữ phía Client (`window.localStorage`) để đảm bảo trải nghiệm xuyên suốt mà không cần Backend server:

| Khóa Lưu Trữ (Storage Key) | Kiểu Dữ Liệu | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| `trendmart_cart_v1` | `Array<CartItem>` | Lưu danh sách sản phẩm trong giỏ, số lượng, giá và tồn kho. |
| `trendmart_wishlist_v1` | `Array<Number>` | Lưu danh sách ID các sản phẩm người dùng đã thả tim yêu thích. |
| `trendmart_theme_v1` | `String ('light'\|'dark')` | Lưu cài đặt giao diện Sáng / Tối của người dùng. |
| `trendmart_auth_user_v1` | `Object` | Lưu phiên đăng nhập của người dùng hiện tại (Họ tên, Email, SĐT). |
| `trendmart_users_db_v1` | `Array<User>` | Cơ sở dữ liệu danh sách người dùng đã đăng ký trên trình duyệt. |

> 💡 **Cơ chế đồng bộ thời gian thực:** Mọi thao tác cập nhật giỏ hàng đều kích hoạt Custom Event `cartChanged`, giúp Header Badge, Drawer, Giỏ hàng và Trang chi tiết luôn đồng bộ trạng thái tức thì.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Trải Nghiệm

Dự án được xây dựng hoàn toàn độc lập, không yêu cầu cài đặt NPM, Webpack hay bất kỳ máy chủ phức tạp nào.

### Cách 1: Mở Trực Tiếp Trên Trình Duyệt (Khuyên Dùng)
1. Truy cập vào thư mục `dự án`.
2. Nhấp đúp vào tệp tin `index.html` (hoặc click chuột phải chọn **Open with** $\rightarrow$ **Google Chrome / Microsoft Edge / Firefox**).
3. Bắt đầu trải nghiệm mua sắm ngay lập tức!

### Cách 2: Sử Dụng Tiện Ích VS Code Live Server
1. Mở thư mục `dự án` trong Visual Studio Code.
2. Cài đặt tiện ích mở rộng **Live Server** (tác giả *Ritwick Dey*).
3. Click chuột phải vào `index.html` và chọn **Open with Live Server** (cổng mặc định `http://127.0.0.1:5500`).

---

## 🧪 6. Dữ Liệu Kiểm Thử & Kịch Bản Mẫu (Test Scenarios)

### Kịch bản 1: Kiểm thử Đăng nhập & Tự động điền
- Nhấp nút **Đăng nhập** trên thanh Header.
- Nhập tài khoản mẫu:
  - **Email:** `demo@trendmart.vn`
  - **Mật khẩu:** `123`
- Nhấn **Đăng nhập**. Quan sát Header hiển thị avatar người dùng và tên hiển thị `Minh Quang`.

### Kịch bản 2: Kiểm thử Giỏ hàng & Thanh Freeship
1. Thêm một sản phẩm có giá dưới 1.000.000₫ vào giỏ hàng (Ví dụ: *Áo Blazer 620.000₫*).
2. Chuyển sang trang **Giỏ hàng (`cart.html`)**:
   - Thanh tiến trình Freeship thông báo: *"Mua thêm 380.000₫ để nhận MIỄN PHÍ VẬN CHUYỂN"*.
   - Phí vận chuyển hiển thị là `30.000₫`.
3. Nhấn nút `[+]` để tăng số lượng lên 2 chiếc:
   - Tổng tiền hàng đạt `1.240.000₫` ($\ge$ 1.000.000₫).
   - Thanh tiến trình đổi sang màu xanh thành công: *"Bạn đã đủ điều kiện được Freeship!"*.
   - Phí vận chuyển tự động chuyển thành `Miễn phí` (`0₫`).

### Kịch bản 3: Kiểm thử Áp dụng Voucher
- Tại ô nhập mã giảm giá ở trang Giỏ hàng, nhập mã `FIRST15` và bấm **Áp dụng**.
- Hệ thống trừ ngay **15%** trên tổng tiền hàng và hiển thị dòng giảm giá rõ ràng.

### Kịch bản 4: Kiểm thử Thanh toán VietQR & Đặt hàng
- Chọn phương thức thanh toán **Chuyển khoản VietQR**.
- Hệ thống hiển thị box thông tin ngân hàng và mã QR thanh toán động.
- Điền đầy đủ thông tin giao hàng (hoặc nhấn để hệ thống tự điền nếu đã đăng nhập) và bấm **Xác Nhận Đặt Hàng**.
- Modal chúc mừng xuất hiện hiển thị mã vận đơn duy nhất (`#TM-XXXXX`) và làm sạch giỏ hàng.

---

## 📋 7. Đánh Giá Mức Độ Hoàn Thành Yêu Cầu Học Phần

| Hạng mục yêu cầu | Tiêu chuẩn đánh giá | Mức độ hoàn thành |
| :--- | :--- | :---: |
| **HTML5 & Semantic** | Sử dụng thẻ chuẩn ngữ nghĩa (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`). | **100%** ✅ |
| **CSS3 Hiện đại** | CSS Variables (Tokens), CSS Grid 4 cột, Flexbox căn chỉnh, bóng khuếch tán, chuyển động mượt mà. | **100%** ✅ |
| **Chế độ Dark / Light** | Hoán đổi màu mượt mà, lưu vào localStorage, độ tương phản chuẩn WCAG. | **100%** ✅ |
| **JavaScript ES6+** | Arrow functions, Modules pattern, Destructuring, Event Listeners, LocalStorage API. | **100%** ✅ |
| **Giỏ hàng & Freeship** | Tính toán tức thì thuế 8% VAT, phí ship, thanh freeship 1 triệu, kiểm tra tồn kho. | **100%** ✅ |
| **Bộ lọc & Tìm kiếm** | Lọc theo danh mục, khoảng giá slider, badge, live search thời gian thực. | **100%** ✅ |
| **Responsive Design** | Hiển thị tối ưu từ Desktop, Laptop, Tablet cho đến Smartphone (tích hợp Mobile Bottom Bar). | **100%** ✅ |

---

## 👨‍💻 8. Thông Tin Tác Giả & Bản Quyền

- **Họ và tên:** Võ Minh Quang
- **Mã số sinh viên (MSSV):** 125001101
- **Lớp chuyên ngành:** 25CT112
- **Đồ án môn học:** Thiết Kế & Phát Triển Ứng Dụng Web Thương Mại Điện Tử
- **Bản quyền:** © 2026 TrendMart. Mã nguồn mở phục vụ mục đích học tập và nghiên cứu.
