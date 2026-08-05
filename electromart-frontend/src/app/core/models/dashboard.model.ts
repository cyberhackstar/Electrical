import { OrderResponse } from './order.model';

export interface TopProductResponse {
  productId: number;
  productName: string;
  unitsSold: number;
}

export interface LowStockProductResponse {
  productId: number;
  productName: string;
  sku: string;
  stockQuantity: number;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  recentOrders: OrderResponse[];
  topSellingProducts: TopProductResponse[];
  lowStockProducts: LowStockProductResponse[];
}
