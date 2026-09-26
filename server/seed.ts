// Demo OLTP (source) data inserted into SalesDW when the source tables are empty.
import type { Customer, Product, Order, OrderItem } from "../src/types";

// OLTP - Source Transactional Data
export const initialCustomers: Customer[] = [
  { customer_id: 1, name: "Somchai Meedee", email: "somchai@email.com", city: "Bangkok", age: 34, created_at: "2026-01-05" },
  { customer_id: 2, name: "Wipaporn Raksuai", email: "wipaporn@email.com", city: "Chiang Mai", age: 28, created_at: "2026-01-10" },
  { customer_id: 3, name: "Thanaphol Submak", email: "thanaphol@email.com", city: "Nonthaburi", age: 45, created_at: "2026-01-15" },
  { customer_id: 4, name: "Oranong Jaiyen", email: "ononong@email.com", city: "Chonburi", age: 31, created_at: "2026-02-02" },
  { customer_id: 5, name: "Kiatisak Poonpol", email: "kiatisak@email.com", city: "Khon Kaen", age: 24, created_at: "2026-02-18" },
  { customer_id: 6, name: "Jiraporn Saentawee", email: "jiraporn@email.com", city: "Bangkok", age: 37, created_at: "2026-03-01" },
  { customer_id: 7, name: "Noppadol Saengtong", email: "noppadol@email.com", city: "Phuket", age: 52, created_at: "2026-03-12" },
  { customer_id: 8, name: "Piyapong Yodyiam", email: "piyapong@email.com", city: "Surat Thani", age: 29, created_at: "2026-04-05" },
  { customer_id: 9, name: "Sudaporn Duangdee", email: "sudaporn@email.com", city: "Roi Et", age: 41, created_at: "2026-04-19" },
  { customer_id: 10, name: "Chatchai Meethong", email: "chatchai@email.com", city: "Bangkok", age: 33, created_at: "2026-05-01" }
];

export const initialProducts: Product[] = [
  { product_id: 101, name: "Smart TV 55\"", category: "Electronics", unit_price: 18500, cost_price: 13500 },
  { product_id: 102, name: "Wireless Headphones", category: "Electronics", unit_price: 3200, cost_price: 2100 },
  { product_id: 103, name: "Microwave Oven", category: "Home Appliance", unit_price: 4500, cost_price: 3100 },
  { product_id: 104, name: "Vacuum Cleaner", category: "Home Appliance", unit_price: 5900, cost_price: 4000 },
  { product_id: 105, name: "Ergonomic Office Chair", category: "Furniture", unit_price: 7500, cost_price: 5200 },
  { product_id: 106, name: "Moka Pot & Coffee Set", category: "Home Appliance", unit_price: 2500, cost_price: 1700 },
  { product_id: 107, name: "Mechanical Keyboard", category: "Electronics", unit_price: 3900, cost_price: 2600 },
  { product_id: 108, name: "Standing Desk", category: "Furniture", unit_price: 12500, cost_price: 9000 },
  { product_id: 109, name: "Air Purifier", category: "Home Appliance", unit_price: 8900, cost_price: 6100 }
];

// 45 sample transactions across Jan - Jun 2026
export const initialOrders: Order[] = [
  // Jan
  { order_id: 1001, customer_id: 1, order_date: "2026-01-12", status: "Completed" },
  { order_id: 1002, customer_id: 2, order_date: "2026-01-15", status: "Completed" },
  { order_id: 1003, customer_id: 3, order_date: "2026-01-22", status: "Completed" },
  // Feb
  { order_id: 1004, customer_id: 1, order_date: "2026-02-05", status: "Completed" },
  { order_id: 1005, customer_id: 4, order_date: "2026-02-10", status: "Completed" },
  { order_id: 1006, customer_id: 5, order_date: "2026-02-19", status: "Completed" },
  { order_id: 1007, customer_id: 2, order_date: "2026-02-28", status: "Completed" },
  // Mar
  { order_id: 1008, customer_id: 3, order_date: "2026-03-05", status: "Completed" },
  { order_id: 1009, customer_id: 6, order_date: "2026-03-15", status: "Completed" },
  { order_id: 1010, customer_id: 7, order_date: "2026-03-22", status: "Completed" },
  { order_id: 1011, customer_id: 1, order_date: "2026-03-28", status: "Completed" },
  // Apr
  { order_id: 1012, customer_id: 4, order_date: "2026-04-02", status: "Completed" },
  { order_id: 1013, customer_id: 8, order_date: "2026-04-10", status: "Completed" },
  { order_id: 1014, customer_id: 9, order_date: "2026-04-22", status: "Completed" },
  { order_id: 1015, customer_id: 5, order_date: "2026-04-26", status: "Completed" },
  { order_id: 1016, customer_id: 2, order_date: "2026-04-30", status: "Completed" },
  // May
  { order_id: 1017, customer_id: 10, order_date: "2026-05-02", status: "Completed" },
  { order_id: 1018, customer_id: 3, order_date: "2026-05-08", status: "Completed" },
  { order_id: 1019, customer_id: 1, order_date: "2026-05-15", status: "Completed" },
  { order_id: 1020, customer_id: 6, order_date: "2026-05-20", status: "Completed" },
  { order_id: 1021, customer_id: 7, order_date: "2026-05-25", status: "Completed" },
  // Jun
  { order_id: 1022, customer_id: 2, order_date: "2026-06-02", status: "Completed" },
  { order_id: 1023, customer_id: 4, order_date: "2026-06-04", status: "Completed" },
  { order_id: 1024, customer_id: 8, order_date: "2026-06-08", status: "Completed" },
  { order_id: 1025, customer_id: 10, order_date: "2026-06-10", status: "Completed" }
];

export const initialOrderItems: OrderItem[] = [
  // Jan
  { item_id: 1, order_id: 1001, product_id: 101, quantity: 1, price: 18500 }, // Somchai
  { item_id: 2, order_id: 1001, product_id: 102, quantity: 1, price: 3200 },
  { item_id: 3, order_id: 1002, product_id: 103, quantity: 1, price: 4500 }, // Wipaporn
  { item_id: 4, order_id: 1003, product_id: 105, quantity: 2, price: 7500 }, // Thanaphol
  // Feb
  { item_id: 5, order_id: 1004, product_id: 106, quantity: 1, price: 2500 }, // Somchai
  { item_id: 6, order_id: 1005, product_id: 104, quantity: 1, price: 5900 }, // Oranong
  { item_id: 7, order_id: 1006, product_id: 107, quantity: 1, price: 3900 }, // Kiatisak
  { item_id: 8, order_id: 1007, product_id: 102, quantity: 2, price: 3200 }, // Wipaporn
  { item_id: 9, order_id: 1007, product_id: 106, quantity: 1, price: 2500 },
  // Mar
  { item_id: 10, order_id: 1008, product_id: 108, quantity: 1, price: 12500 }, // Thanaphol
  { item_id: 11, order_id: 1009, product_id: 101, quantity: 1, price: 18500 }, // Jiraporn
  { item_id: 12, order_id: 1010, product_id: 109, quantity: 2, price: 8900 }, // Noppadol
  { item_id: 13, order_id: 1011, product_id: 104, quantity: 1, price: 5900 }, // Somchai
  // Apr
  { item_id: 14, order_id: 1012, product_id: 105, quantity: 1, price: 7500 }, // Oranong
  { item_id: 15, order_id: 1012, product_id: 107, quantity: 1, price: 3900 },
  { item_id: 16, order_id: 1013, product_id: 103, quantity: 1, price: 4500 }, // Piyapong
  { item_id: 17, order_id: 1014, product_id: 109, quantity: 1, price: 8900 }, // Sudaporn
  { item_id: 18, order_id: 1015, product_id: 108, quantity: 1, price: 12500 }, // Kiatisak
  { item_id: 19, order_id: 1016, product_id: 101, quantity: 1, price: 18500 }, // Wipaporn
  // May
  { item_id: 20, order_id: 1017, product_id: 101, quantity: 1, price: 18500 }, // Chatchai
  { item_id: 21, order_id: 1017, product_id: 102, quantity: 1, price: 3200 },
  { item_id: 22, order_id: 1018, product_id: 104, quantity: 1, price: 5900 }, // Thanaphol
  { item_id: 23, order_id: 1018, product_id: 109, quantity: 1, price: 8900 },
  { item_id: 24, order_id: 1019, product_id: 108, quantity: 1, price: 12500 }, // Somchai
  { item_id: 25, order_id: 1020, product_id: 105, quantity: 1, price: 7500 }, // Jiraporn
  { item_id: 26, order_id: 1021, product_id: 103, quantity: 2, price: 4500 }, // Noppadol
  // Jun
  { item_id: 27, order_id: 1022, product_id: 104, quantity: 1, price: 5900 }, // Wipaporn
  { item_id: 28, order_id: 1023, product_id: 101, quantity: 1, price: 18500 }, // Oranong
  { item_id: 29, order_id: 1024, product_id: 107, quantity: 2, price: 3900 }, // Piyapong
  { item_id: 30, order_id: 1025, product_id: 109, quantity: 1, price: 8900 }  // Chatchai
];

