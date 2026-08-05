import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'ElectroMart — Genuine Electrical Supplies Online',
  },

  // ---- Auth (built next) ----
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login | ElectroMart',
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Create Account | ElectroMart',
  },
  {
    path: 'auth/forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password | ElectroMart',
  },

  // ---- Catalog (built next) ----
  {
    path: 'products',
    loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'All Products | ElectroMart',
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Shop by Category | ElectroMart',
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },

  // ---- Cart / Checkout ----
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Your Cart | ElectroMart',
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout | ElectroMart',
  },
  {
    path: 'order-confirmation/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Order Confirmed | ElectroMart',
  },

  // ---- Account (customer, protected) ----
  {
    path: 'account/orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/order-history/order-history.component').then(m => m.OrderHistoryComponent),
    title: 'My Orders | ElectroMart',
  },
  {
    path: 'account/orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    title: 'Order Details | ElectroMart',
  },
  {
    path: 'account/addresses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/addresses/addresses.component').then(m => m.AddressesComponent),
    title: 'My Addresses | ElectroMart',
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/wishlist/wishlist.component').then(m => m.WishlistComponent),
    title: 'My Wishlist | ElectroMart',
  },

  // ---- Admin (protected, nested under shared layout) ----
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard | ElectroMart',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Manage Products | ElectroMart',
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
        title: 'Manage Categories | ElectroMart',
      },
      {
        path: 'brands',
        loadComponent: () => import('./features/admin/brands/admin-brands.component').then(m => m.AdminBrandsComponent),
        title: 'Manage Brands | ElectroMart',
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        title: 'Manage Orders | ElectroMart',
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/coupons/admin-coupons.component').then(m => m.AdminCouponsComponent),
        title: 'Manage Coupons | ElectroMart',
      },
      {
        path: 'questions',
        loadComponent: () => import('./features/admin/questions/admin-questions.component').then(m => m.AdminQuestionsComponent),
        title: 'Product Questions | ElectroMart',
      },
    ],
  },

  // ---- Static / informational pages ----
  {
    path: 'about',
    loadComponent: () => import('./features/static/about/about.component').then(m => m.AboutComponent),
    title: 'About Us | ElectroMart',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/static/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us | ElectroMart',
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/static/faq/faq.component').then(m => m.FaqComponent),
    title: 'FAQs | ElectroMart',
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./features/static/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | ElectroMart',
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/static/terms/terms.component').then(m => m.TermsComponent),
    title: 'Terms of Service | ElectroMart',
  },
  {
    path: 'shipping-policy',
    loadComponent: () => import('./features/static/shipping-policy/shipping-policy.component').then(m => m.ShippingPolicyComponent),
    title: 'Shipping & Returns | ElectroMart',
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
