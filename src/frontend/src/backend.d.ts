import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type QuoteId = bigint;
export type CustomerId = string;
export interface Quote {
    id: QuoteId;
    tax: number;
    customerName: string;
    lineItems: Array<QuoteLineItem>;
    created: bigint;
    total: number;
    customerId: CustomerId;
    subtotal: number;
}
export type ProductId = string;
export interface Customer {
    id: CustomerId;
    name: string;
    email: string;
    address: string;
    phone: string;
}
export interface QuoteLineItem {
    total: number;
    productId: ProductId;
    productName: string;
    quantity: bigint;
    unitPrice: number;
}
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    quantity: bigint;
    price: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adjustProductStock(id: ProductId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomer(customer: Customer): Promise<void>;
    createProduct(product: Product): Promise<void>;
    createQuote(customerId: CustomerId, lineItems: Array<QuoteLineItem>): Promise<Quote>;
    deleteCustomer(id: CustomerId): Promise<void>;
    deleteProduct(id: ProductId): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: CustomerId): Promise<Customer>;
    getProduct(id: ProductId): Promise<Product>;
    getQuote(id: QuoteId): Promise<Quote>;
    isCallerAdmin(): Promise<boolean>;
    listCustomers(): Promise<Array<Customer>>;
    listProducts(): Promise<Array<Product>>;
    listQuotes(): Promise<Array<Quote>>;
    listQuotesByCustomer(customerId: CustomerId): Promise<Array<Quote>>;
    updateCustomer(customer: Customer): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
