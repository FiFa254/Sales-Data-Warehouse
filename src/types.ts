export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  city: string;
  age: number;
  created_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  status: string;
}

export interface OrderItem {
  item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number; // selling price at that time
}

// Data Warehouse - Dimensions & Fact Tables
export interface DimCustomer {
  customer_key: number; // surrogate key
  customer_id: number;   // natural key from source
  name: string;
  city: string;
  tier: "Standard" | "Silver" | "Gold" | "Platinum";
  registration_year: number;
}

export interface DimProduct {
  product_key: number;  // surrogate key
  product_id: number;   // natural key
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
}

export interface DimTime {
  time_key: number; // YYYYMMDD
  full_date: string;
  day_of_week: string;
  day_of_month: number;
  month_name: string;
  quarter: number;
  year: number;
}

export interface FactSales {
  sale_id: number;
  customer_key: number;
  product_key: number;
  time_key: number;
  quantity: number;
  unit_price: number;
  cost_price: number;
  revenue: number;      // quantity * unit_price
  cost: number;         // quantity * cost_price
  profit: number;       // revenue - cost
  discount: number;
}

export interface SqlQuery {
  id: string;
  title: string;
  sql: string;
  description: string;
  category: "Aggregations" | "Trends" | "Slicing" | "RFM";
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}
