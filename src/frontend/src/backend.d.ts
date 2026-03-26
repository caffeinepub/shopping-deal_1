import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CustomerOffer {
    id: string;
    customerName: string;
    title: string;
    createdAt: bigint;
    description: string;
    customerId: Principal;
    image?: ExternalBlob;
    price: bigint;
}
export interface FounderOffer {
    id: string;
    title: string;
    createdAt: bigint;
    description: string;
    productId?: string;
    discount: bigint;
    image?: ExternalBlob;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    paymentMethod: string;
    createdAt: bigint;
    totalAmount: bigint;
    customerId: Principal;
    items: Array<ProductOrderItem>;
    customerEmail: string;
}
export interface AppSettings {
    appName: string;
    logo?: ExternalBlob;
}
export interface ProductOrderItem {
    name: string;
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Product {
    id: string;
    name: string;
    createdAt: bigint;
    description: string;
    founderId: Principal;
    category: ProductCategory;
    image?: ExternalBlob;
    price: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum OrderStatus {
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum ProductCategory {
    other = "other",
    home = "home",
    beauty = "beauty",
    books = "books",
    sports = "sports",
    fashion = "fashion",
    electronics = "electronics"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomerOffer(offer: CustomerOffer): Promise<void>;
    createFounderOffer(offer: FounderOffer): Promise<void>;
    createProduct(product: Product): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getAllOffers(): Promise<{
        founderOffers: Array<FounderOffer>;
        customerOffers: Array<CustomerOffer>;
    }>;
    getAllOrders(): Promise<Array<Order>>;
    getAppSettings(): Promise<AppSettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(userId: Principal): Promise<Array<CartItem>>;
    getProduct(productId: string): Promise<Product>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAppSettings(appName: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: Order): Promise<void>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAppName(appName: string): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
