# Ayurvedic Super App — Complete Walkthrough

> Yeh document interview ya group discussion ke liye hai. Poora app ka flow, screens, aur data sources yahan explain kiye gaye hain.

---

## App Kya Hai?

Ek **React Native (Expo)** app jo teen kaam karti hai:
1. **Doctor se consultation book karo** (Ayurvedic doctors)
2. **Ayurvedic products kharido** (E-commerce)
3. **Health records dekho** (Patient timeline)

Tech stack: TypeScript, Expo SDK 57, Redux Toolkit, React Navigation.

---

## App Kaise Khulti Hai? (Entry Point Flow)

```
App.tsx
  └── AppProviders (Redux Store + PersistGate, Theme, Toast, Network, i18n)
        └── RootNavigator
              └── Bottom Tab Navigator (4 tabs)
                    ├── 🩺 Consultation Tab
                    ├── 🛒 Shop Tab
                    ├── 📋 Records Tab
                    └── ⚙️ Settings Tab
```

**AppProviders** mein yeh sab wrap hota hai:
- Redux Store + PersistGate (saara state yahan — server data bhi, client data bhi)
- ThemeProvider (light/dark/system)
- ToastProvider (global notifications)
- NetworkProvider (online/offline detect)
- i18n (English + Hindi)

---

## Module 1: Consultation (🩺 Doctor Booking)

### Screen Flow
```
DoctorListScreen
    │  (doctor card tap)
    ▼
DoctorDetailScreen
    │  (slot select + "Book" button)
    ▼
BookingConfirmScreen
    │  (confirm button)
    ▼
DoctorListScreen (popToTop)
    │
    └── [Header button 📅] ──▶ UpcomingBookingsScreen
```

### Screen-by-Screen

#### 1. DoctorListScreen
- **Kya dikhta hai:** Doctor cards — naam, specialty, city, rating, fee
- **Features:** Search bar (300ms debounce), Specialty filter chips, City filter chips
- **Data kahan se:** `useDoctors(filters)` → Redux `fetchDoctors` thunk → `consultationApi.getDoctors()` → Mock API → `generateDoctor(index)`
- **Pagination:** Infinite scroll, 20 doctors per page — `page` number `doctorsSlice` mein track hota hai
- **Performance:** FlashList + React.memo on DoctorCard + useCallback

#### 2. DoctorDetailScreen
- **Kya dikhta hai:** Doctor photo, bio, rating, experience, available time slots
- **Features:** Slot chips (available slots only), "Book" button (disabled jab tak slot select na ho)
- **Data kahan se:**
  - Doctor info: `useDoctor(doctorId)` → Redux `fetchDoctor` thunk → `consultationApi.getDoctor(id)`
  - Slots: `useDoctorSlots(doctorId, date)` → Redux `fetchSlots` thunk → `consultationApi.getSlots()` → `generateSlotsForDoctor()`
  - Slots kal ke dikhte hain (tomorrow), expired aur booked slots filter ho jaate hain

#### 3. BookingConfirmScreen
- **Kya dikhta hai:** Doctor naam, date, time — confirm/cancel buttons
- **Kya hota hai confirm pe:**
  - **Online:** Redux `createBooking` thunk dispatch → `consultationApi.createBooking()` → `doctorsSlice` mein booking add
  - **Offline:** `offlineQueue` mein save hoti hai, Redux `addPendingBooking` dispatch → `pending_sync` status
- **Error handling:** Slot conflict (CONFLICT error), expired slot, generic error — sab ke liye alag toast

#### 4. UpcomingBookingsScreen
- **Kya dikhta hai:** Sari bookings — confirmed (green), pending_sync (yellow), cancelled (red)
- **Data kahan se:** `useBookings()` hook — `bookingSlice` (pending) + `doctorsSlice.bookings` (API fetched) merge karke dikhata hai
- **Cancel:** Alert confirm → `useCancelBooking()` → Redux `cancelBooking` thunk → offline queue ya direct API

### Data Source (Consultation)
```
Mock API ──▶ generateDoctor(index)
              - 5,000 doctors total (DOCTOR_COUNT)
              - Seed-based random: same index = same doctor hamesha
              - Fields: name, specialty, city, rating, fee, bio, imageUrl

generateSlotsForDoctor(doctorId, date)
              - 8 slots per doctor (9am to 5pm)
              - 20% slots randomly booked (seed-based)
```

---

## Module 2: Shop (🛒 E-Commerce)

### Screen Flow
```
ProductListScreen
    │  (product card tap)
    ▼
ProductDetailScreen
    │  (Add to Cart)
    ▼  (Cart icon in header)
CartScreen
    │  (Checkout button)
    ▼
CheckoutScreen
    │  (Place Order)
    ▼
ProductListScreen (popToTop, cart clear)

ProductListScreen
    │  (Wishlist icon ♡ in header)
    ▼
WishlistScreen
    │  (product tap)
    ▼
ProductDetailScreen
```

### Screen-by-Screen

#### 1. ProductListScreen
- **Kya dikhta hai:** Product cards — image, naam, price, rating, wishlist button (♡/♥)
- **Features:** Search (debounced), Category filter chips, Sort chips (name/price asc/price desc/rating), In-stock toggle
- **Data kahan se:** `useProducts(filters)` → Redux `fetchProducts` thunk → `shopApi.getProducts()` → Mock API → `generateProduct(index)`
- **Wishlist button:** Feature flag `enableShopWishlist` se control hota hai (runtime toggle)
- **Pagination:** Infinite scroll, 20 products per page — `page` number `productsSlice` mein track hota hai

#### 2. ProductDetailScreen
- **Kya dikhta hai:** Full product — image, naam, price (strikethrough original price), rating, reviews, description
- **Buttons:** "Add to Cart" (disabled if out of stock), "Add to Wishlist" / "Wishlisted"
- **Data kahan se:** `useProduct(productId)` → Redux `fetchProduct` thunk → `shopApi.getProduct(id)`
- **Cart action:** Redux `addItem` dispatch (`cartSlice`)
- **Wishlist action:** Redux `toggleWishlist` dispatch (`wishlistSlice`)

#### 3. CartScreen
- **Kya dikhta hai:** Cart items — image, naam, price, quantity +/- buttons, remove button; Total at bottom
- **Data kahan se:** Redux `selectCartItems`, `selectCartTotal` — `cartSlice` se directly
- **Actions:** `updateQuantity`, `removeItem` — sab Redux dispatches
- **Max items:** Feature flag `maxCartItems` se limit hoti hai

#### 4. CheckoutScreen
- **Kya dikhta hai:** Order summary (items × qty), subtotal, shipping (free above ₹500), total
- **Place Order:** `clearCart` dispatch, success toast, popToTop
- **Note:** Yeh mock checkout hai — real payment gateway nahi hai

#### 5. WishlistScreen
- **Kya dikhta hai:** Wishlisted products — discount badge, out-of-stock overlay, "Add to Cart" + remove buttons
- **Data kahan se:** Redux `selectWishlistIds` → `generateProduct(getProductIndex(id))` — directly generator se, no API call
- **Actions:** Add to cart (`cartSlice`), remove from wishlist (`wishlistSlice`)

### Data Source (Shop)
```
Mock API ──▶ generateProduct(index)
              - 20,000 products total (PRODUCT_COUNT)
              - Seed-based: Organic/Pure/Himalayan + Ashwagandha/Triphala/Brahmi etc.
              - Fields: name, price, originalPrice, category, rating, reviewCount, inStock, tags
```

---

## Module 3: Health Records (📋 Patient Timeline)

### Screen Flow
```
RecordsTimelineScreen
    │  (record card tap)
    ▼
RecordDetailScreen
```

### Screen-by-Screen

#### 1. RecordsTimelineScreen
- **Kya dikhta hai:** Health record cards — title, type (color-coded), date, provider, tags, attachment thumbnail
- **Record types (color-coded):**
  - 🔵 Lab Report
  - 🟢 Prescription
  - 🟤 Consultation
  - 🟣 Vaccination
  - 🔴 Allergy
- **Features:** Search, Type filter chips, Group by: None / Month / Year
- **Data kahan se:** `useHealthRecordsInfinite(filters)` → Redux `fetchHealthRecords` thunk → `healthRecordsApi.getRecords()` → `generateHealthRecord(index)`
- **Pagination:** Infinite scroll, 30 records per page — `page` number `healthRecordsSlice` mein track hota hai

#### 2. RecordDetailScreen
- **Kya dikhta hai:** Title, date, provider, description, tags, attachment (image ya PDF link)
- **Attachment:** Image dikhta hai inline; PDF ke liye "View PDF" button jo `Linking.openURL()` se khulta hai
- **Data kahan se:** `useHealthRecord(recordId)` → Redux `fetchHealthRecord` thunk → `healthRecordsApi.getRecord(id)`

### Data Source (Health Records)
```
Mock API ──▶ generateHealthRecord(index)
              - 10,000 records total (HEALTH_RECORD_COUNT)
              - Random date (last 5 years)
              - Provider: Apollo Ayurveda / Kerala Ayurveda / Jiva Clinic / Patanjali
              - 60% records mein attachment hoti hai (image ya PDF)
```

---

## Module 4: Settings (⚙️)

### SettingsScreen
- **Theme toggle:** Light / Dark / System (device follow karta hai)
- **Language toggle:** English / हिंदी
- **Data:** ThemeProvider (AsyncStorage persist) + i18next

---

## Data Flow — Poora Picture

```
┌─────────────────────────────────────────────────────┐
│                    UI Screens                        │
└─────────────────────┬───────────────────────────────┘
                      │
               Redux Store (RTK)
     ┌────────────────┼────────────────┐
doctorsSlice   productsSlice   healthRecordsSlice
cartSlice      wishlistSlice   bookingSlice
     └────────────────┼────────────────┘
               createAsyncThunk
                      │
             core/api/client.ts
                      │
             Mock API (mockApi.ts)
                      │
             ┌────────┴────────┐
             │   Generators    │
             │  (on-demand)    │
             └─────────────────┘
         generateDoctor(index)
         generateProduct(index)
         generateHealthRecord(index)
```

### Kyun Mock Data?
- Real backend nahi hai, lekin **5k doctors, 20k products, 10k records** ka data hai
- Data **on-demand generate** hota hai — memory mein sab load nahi hota
- Same index = same data hamesha (seeded random) — consistent experience

---

## Offline Behavior

| Situation | Kya hota hai |
|-----------|-------------|
| Offline + list screen | Redux mein jo data pehle fetch hua tha woh dikhta hai |
| Offline + booking | `offlineQueue` mein save, `bookingSlice` mein `pending_sync` |
| Back online | `syncManager` queue process karta hai |
| Cart | `redux-persist` — app restart ke baad bhi cart rehti hai |
| Network banner | Offline hone pe top pe banner dikhta hai |

---

## State Management — Kahan Kya Hai

Poore app mein sirf **Redux Toolkit** use hota hai — server data bhi, client data bhi.

**Server data slices** (API calls `createAsyncThunk` se):
- `doctorsSlice` — doctor list, selected doctor, slots, bookings, specialties + pagination state
- `productsSlice` — product list, selected product + pagination state
- `healthRecordsSlice` — records list, selected record + pagination state

**Client state slices** (synchronous local state):
- `cartSlice` — cart items, quantity management
- `wishlistSlice` — wishlisted product IDs
- `bookingSlice` — offline pending bookings

**Persistence** — `redux-persist` se cart, wishlist, booking AsyncStorage mein save hote hain.

| Data | Slice | Persist? |
|------|-------|----------|
| Doctor list + slots + bookings | doctorsSlice | No |
| Product list + detail | productsSlice | No |
| Health records list + detail | healthRecordsSlice | No |
| Cart items | cartSlice | AsyncStorage |
| Wishlist | wishlistSlice | AsyncStorage |
| Pending bookings | bookingSlice | AsyncStorage |
| Theme preference | ThemeProvider | AsyncStorage |
| Language | i18next | AsyncStorage |
| Auth token | SecureStore | Encrypted |

---

## Deep Links

App ko directly kisi bhi screen pe open kar sakte ho:

```
ayurvedic://consult                    → DoctorListScreen
ayurvedic://consult/doctor/doc-42      → DoctorDetailScreen (doctor #42)
ayurvedic://consult/bookings           → UpcomingBookingsScreen
ayurvedic://shop                       → ProductListScreen
ayurvedic://shop/product/prod-100      → ProductDetailScreen (product #100)
ayurvedic://shop/cart                  → CartScreen
ayurvedic://records                    → RecordsTimelineScreen
ayurvedic://records/rec-50             → RecordDetailScreen (record #50)
ayurvedic://settings                   → SettingsScreen
```

---

## Feature Flags (Runtime Toggles)

| Flag | Kya control karta hai |
|------|-----------------------|
| `enableShopWishlist` | Wishlist button show/hide on product cards |
| `enableVideoConsultation` | Video call option (future) |
| `checkoutVariant` | A/B test checkout flow |
| `maxCartItems` | Cart mein max kitne items |

---

## Mock API — Failure Simulation

Real production jaisi reliability test ke liye:
- **5% random failures** — network error simulate
- **10% slow requests** — 3x delay
- **Timeout** — AbortController se handle
- **401 Unauthorized** — session expiry
- **Slot conflict** — double booking prevent
- **Expired slot** — purana slot book karne ki koshish

---

## Quick Summary for Interview

> "Yeh ek Ayurvedic super app hai jisme teen modules hain — Consultation, Shop, aur Health Records. App React Native + Expo se bani hai. State management ke liye poore app mein sirf **Redux Toolkit** use kiya hai — server data (doctor list, products, health records) `createAsyncThunk` se fetch hota hai aur Redux slices mein store hota hai, aur client state (cart, wishlist, pending bookings) bhi Redux mein hai. Persistence ke liye `redux-persist` use kiya hai jo cart aur wishlist AsyncStorage mein save karta hai. Real backend nahi hai — ek mock API hai jo procedurally data generate karta hai (5k doctors, 20k products, 10k records) on-demand, taaki memory efficient rahe. App offline bhi kaam karti hai — bookings queue hoti hain aur cart persist rehti hai. Feature flags se runtime pe features toggle kar sakte hain."
