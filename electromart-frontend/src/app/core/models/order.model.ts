export type PaymentMethod = 'RAZORPAY' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: OrderItemResponse[];
  itemsTotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  totalAmount: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface CheckoutRequest {
  addressId: number;
  couponCode?: string;
}

export interface RazorpayOrderResponse {
  internalOrderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  razorpayKeyId: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderStatusUpdateRequest {
  orderStatus: OrderStatus;
}
