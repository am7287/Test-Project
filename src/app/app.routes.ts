import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { LogoutPageComponent } from './pages/logout-page.component';
import { CartPageComponent } from './pages/cart-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';
import { ProductListPageComponent } from './pages/product-list-page.component';
import { SearchPageComponent } from './pages/search-page.component';
import { OrderHistoryPageComponent } from './pages/order-history-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'logout', component: LogoutPageComponent },
  { path: 'products', component: ProductListPageComponent },
  { path: 'cart', component: CartPageComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderHistoryPageComponent, canActivate: [authGuard] },
  { path: 'product/:id', component: ProductDetailPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: '**', redirectTo: 'products' }
];
