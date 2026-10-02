// Client for the SalesDW backend (server.ts). All data comes from SQL Server.

export interface Dashboard {
  source: "warehouse" | "oltp";
  lastEtl: { finishedAt: string; rowsLoaded: number; durationMs: number } | null;
  metrics: { revenue: number; cost: number; profit: number; orders: number; items: number; margin: number; aov: number };
  trend: { month: string; Revenue: number; Profit: number }[];
  tiers: { name: string; Spending: number; Customers: number }[];
  categories: { name: string; Profit: number; sales: number }[];
  source_counts: { customers: number; products: number; orders: number; items: number };
  ordersNotInWarehouse: number;
}

export interface EtlStep {
  phase: "extract" | "transform" | "load";
  message: string;
  rows: number;
  ms: number;
}

export interface EtlResult {
  steps: EtlStep[];
  rowsLoaded: number;
  durationMs: number;
  finishedAt: string;
}

export interface QueryResult {
  headers: string[];
  rows: unknown[][];
  rowCount: number;
  truncated: boolean;
  executionTimeMs: number;
}

export interface SourceOptions {
  customers: { id: number; name: string; city: string }[];
  products: { id: number; name: string; category: string; unitPrice: number }[];
}

async function request<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined
    ? undefined
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  health: () => request<{ database: string; status: string; assistant: "gemini" | "offline" }>("/api/health"),
  dashboard: () => request<Dashboard>("/api/dashboard"),
  runEtl: () => request<EtlResult>("/api/etl/run", {}),
  sourceOptions: () => request<SourceOptions>("/api/source/options"),
  addOrder: (order: { customerId: number; orderDate: string; items: { productId: number; quantity: number }[] }) =>
    request<{ orderId: number; orderDate: string; total: number }>("/api/source/orders", order),
  addCustomer: (customer: { name: string; email: string; city: string; age: number }) =>
    request<{ id: number; name: string; city: string }>("/api/source/customers", customer),
  addProduct: (product: { name: string; category: string; unitPrice: number; costPrice: number }) =>
    request<{ id: number; name: string; category: string; unitPrice: number }>("/api/source/products", product),
  resetSource: () => request<{ success: boolean }>("/api/source/reset", {}),
  clearSource: () => request<{ success: boolean }>("/api/source/clear", {}),
  query: (sql: string) => request<QueryResult>("/api/query", { sql }),
};

export const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
