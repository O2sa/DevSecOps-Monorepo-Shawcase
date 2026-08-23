import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OrdersComponent } from './features/orders/orders.component';
import { ProductsComponent } from './features/products/products.component';
import { UsersComponent } from './features/users/users.component';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Admin Sign In - DevSecOps Dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard],
    title: 'Overview - DevSecOps Dashboard',
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [adminGuard],
    title: 'Orders Management - DevSecOps Dashboard',
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [adminGuard],
    title: 'Products Catalog - DevSecOps Dashboard',
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [adminGuard],
    title: 'User Directory - DevSecOps Dashboard',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
