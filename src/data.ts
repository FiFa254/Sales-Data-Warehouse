import {
  Customer,
  Product,
  Order,
  OrderItem,
  DimCustomer,
  DimProduct,
  DimTime,
  FactSales,
  SqlQuery
} from "./types";

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

// Helper to determine customer Tier based on total spending
export const getCustomerTier = (totalSpend: number): "Standard" | "Silver" | "Gold" | "Platinum" => {
  if (totalSpend >= 30000) return "Platinum";
  if (totalSpend >= 15000) return "Gold";
  if (totalSpend >= 5000) return "Silver";
  return "Standard";
};

// SQL Queries for playground
export const sampleQueries: SqlQuery[] = [
  {
    id: "q1",
    title: "💰 Revenue, Profit, and Cost Summary (Overview)",
    sql: `SELECT 
    COUNT(fs.sale_id) AS Total_Sales_Count,
    SUM(fs.quantity) AS Total_Items_Sold,
    SUM(fs.revenue) AS Total_Revenue,
    SUM(fs.cost) AS Total_Cost,
    SUM(fs.profit) AS Total_Profit,
    ROUND((SUM(fs.profit) / SUM(fs.revenue)) * 100, 2) AS Profit_Margin_Percent
FROM fact_sales fs;`,
    description: "Roll-up analytical query from the Fact Table, summarizing overall sales, costs, profit margins and percentages efficiently.",
    category: "Aggregations"
  },
  {
    id: "q2",
    title: "📈 Monthly Sales and Profit Trends",
    sql: `SELECT 
    dt.year AS Year,
    dt.month_name AS Month,
    SUM(fs.revenue) AS Revenue,
    SUM(fs.profit) AS Profit
FROM fact_sales fs
JOIN dim_time dt ON fs.time_key = dt.time_key
GROUP BY dt.year, dt.month_name
ORDER BY MIN(dt.time_key);`,
    description: "Tracks sales and profit trends over time (Time Series Analysis) by connecting the Fact Sales ledger to the dim_time dimension.",
    category: "Trends"
  },
  {
    id: "q3",
    title: "👥 Customer Loyalty Segment Analysis (RFM Tiers)",
    sql: `SELECT 
    dc.tier AS Customer_Tier,
    COUNT(DISTINCT dc.customer_id) AS Total_Customers,
    SUM(fs.revenue) AS Total_Spending,
    ROUND(AVG(fs.revenue), 2) AS Average_Order_Value,
    SUM(fs.quantity) AS Total_Purchased_Items
FROM fact_sales fs
JOIN dim_customers dc ON fs.customer_key = dc.customer_key
GROUP BY dc.tier
ORDER BY Total_Spending DESC;`,
    description: "Analyzes and groups cumulative spending indicators to identify high-value customer demographics across tiers.",
    category: "RFM"
  },
  {
    id: "q4",
    title: "📦 Best Selling and High Revenue Products",
    sql: `SELECT 
    dp.name AS Product_Name,
    dp.category AS Category,
    SUM(fs.quantity) AS Quantity_Sold,
    SUM(fs.revenue) AS Total_Revenue,
    SUM(fs.profit) AS Total_Profit
FROM fact_sales fs
JOIN dim_products dp ON fs.product_key = dp.product_key
GROUP BY dp.name, dp.category
ORDER BY Total_Profit DESC
LIMIT 5;`,
    description: "Calculates total volumes, gross revenues, and net margins per product to determine top-performing inventory items.",
    category: "Slicing"
  },
  {
    id: "q5",
    title: "📍 Top Generating Sales Provinces (Geographical Analysis)",
    sql: `SELECT 
    dc.city AS Province,
    SUM(fs.revenue) AS Revenue,
    SUM(fs.profit) AS Profit,
    COUNT(DISTINCT fs.customer_key) AS Active_Customers
FROM fact_sales fs
JOIN dim_customers dc ON fs.customer_key = dc.customer_key
GROUP BY dc.city
ORDER BY Revenue DESC;`,
    description: "Performs location-based slicing of gross revenues and net profit margins using the geographic state dimension.",
    category: "Slicing"
  }
];

// Complete downloadable files
export const phpConnectCode = `<?php
/**
 * db_connect.php
 * Configuration script to connect to the MySQL database warehouse using PDO (PHP Data Objects).
 * Supports Unicode UTF-8 and strict error handling exception flows.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'secure_password_here');
define('DB_NAME', 'sales_data_warehouse');
define('DB_PORT', 3306);

try {
    // Generate DSN (Data Source Name)
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";port=" . DB_PORT . ";charset=utf8mb4";
    
    // Strict attributes setup for PDO security & error reporting
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throws Exceptions on SQL syntax/runtime errors
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Always retrieve associative arrays
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Use local SQL engines' native prepare statements against query injection
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Connection successful!
    // echo "Connected successfully!";
} catch (PDOException $e) {
    // Keep credentials secured. Log errors to stderr files.
    error_log("Database Connection Error: " . $e->getMessage());
    die("Error! Technical connection issue failed to link database analytics warehouse.");
}
?>`;

export const phpEtlCode = `<?php
/**
 * etl.php
 * Automated PHP script simulating Extract, Transform, Load (ETL) pipeline.
 * Extracts raw operational records from transactional staging tables (OLTP),
 * transforms elements (RFM Customer Scoring), and binds records into the OLAP Star Schema.
 */

require_once 'db_connect.php';

// Record timer for process diagnostics
$startTime = microtime(true);
echo "=== Starting ETL Pipeline (Extract, Transform, Load) ===\\n";

try {
    $pdo->beginTransaction();

    // ----------------------------------------------------
    // 1. EXTRACT & TRANSFORM: Customer Dimension (dim_customers)
    // ----------------------------------------------------
    echo "Processing customer records and scoring loyalty tiers...\\n";
    
    // Ingestion query pulling cumulative purchase spending to assign loyalty levels
    $custQuery = "
        SELECT 
            c.customer_id, 
            c.name, 
            c.city, 
            YEAR(c.created_at) as reg_year,
            COALESCE(SUM(oi.price * oi.quantity), 0) as total_spend
        FROM oltp_customers c
        LEFT JOIN oltp_orders o ON c.customer_id = o.customer_id AND o.status = 'Completed'
        LEFT JOIN oltp_order_items oi ON o.order_id = oi.order_id
        GROUP BY c.customer_id, c.name, c.city, c.created_at
    ";
    
    $stmt = $pdo->query($custQuery);
    $customers = $stmt->fetchAll();
    
    // Pre-compiled insertion statements
    $insertCust = $pdo->prepare("
        INSERT INTO dim_customers (customer_id, name, city, tier, registration_year)
        VALUES (:customer_id, :name, :city, :tier, :reg_year)
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            city = VALUES(city),
            tier = VALUES(tier)
    ");
    
    foreach ($customers as $row) {
        // TRANSFORM Phase: Dynamically rank spend profiles
        $tier = 'Standard';
        if ($row['total_spend'] >= 30000) $tier = 'Platinum';
        elseif ($row['total_spend'] >= 15000) $tier = 'Gold';
        elseif ($row['total_spend'] >= 5000) $tier = 'Silver';
        
        // LOAD Phase: Ingress dim_customers records
        $insertCust->execute([
            ':customer_id' => $row['customer_id'],
            ':name'        => $row['name'],
            ':city'        => $row['city'],
            ':tier'        => $tier,
            ':reg_year'    => $row['reg_year']
        ]);
    }
    
    // ----------------------------------------------------
    // 2. EXTRACT & LOAD: Product Dimension (dim_products)
    // ----------------------------------------------------
    echo "Ingesting catalogs into product dimension (dim_products)...\\n";
    $prodQuery = "SELECT product_id, name, category, unit_price, cost_price FROM oltp_products";
    $products = $pdo->query($prodQuery)->fetchAll();
    
    $insertProd = $pdo->prepare("
        INSERT INTO dim_products (product_id, name, category, unit_price, cost_price)
        VALUES (:product_id, :name, :category, :unit_price, :cost_price)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            category = VALUES(category),
            unit_price = VALUES(unit_price),
            cost_price = VALUES(cost_price)
    ");
    
    foreach ($products as $row) {
        $insertProd->execute([
            ':product_id' => $row['product_id'],
            ':name'       => $row['name'],
            ':category'   => $row['category'],
            ':unit_price' => $row['unit_price'],
            ':cost_price' => $row['cost_price']
        ]);
    }

    // ----------------------------------------------------
    // 3. EXTRACT, TRANSFORM & LOAD: Time Dimension (dim_time) & Fact Sales Table (fact_sales)
    // ----------------------------------------------------
    echo "Computing central financial ledgers and generating Fact Sales...\\n";
    
    // Ingest core sales data from operational structures
    $salesQuery = "
        SELECT 
            oi.item_id,
            o.customer_id,
            oi.product_id,
            o.order_date,
            oi.quantity,
            oi.price as unit_price,
            p.cost_price,
            (oi.quantity * oi.price) as revenue,
            (oi.quantity * p.cost_price) as cost,
            ((oi.quantity * oi.price) - (oi.quantity * p.cost_price)) as profit
        FROM oltp_order_items oi
        JOIN oltp_orders o ON oi.order_id = o.order_id
        JOIN oltp_products p ON oi.product_id = p.product_id
        WHERE o.status = 'Completed'
    ";
    
    $salesTransactions = $pdo->query($salesQuery)->fetchAll();
    
    // Prep insertion statements for date mapping and fact logs
    $insertTime = $pdo->prepare("
        INSERT INTO dim_time (time_key, full_date, day_of_week, day_of_month, month_name, quarter, year)
        VALUES (:time_key, :full_date, :day_of_week, :day_of_month, :month_name, :quarter, :year)
        ON DUPLICATE KEY UPDATE full_date = full_date
    ");
    
    $insertFact = $pdo->prepare("
        INSERT INTO fact_sales (customer_key, product_key, time_key, quantity, unit_price, cost_price, revenue, cost, profit, discount)
        VALUES (
            (SELECT customer_key FROM dim_customers WHERE customer_id = :cust_id),
            (SELECT product_key FROM dim_products WHERE product_id = :prod_id),
            :time_key, :quantity, :unit_price, :cost_price, :revenue, :cost, :profit, 0
        )
    ");
    
    $factCounter = 0;
    foreach ($salesTransactions as $sale) {
        // TRANSFORM Phase: Build time proxy surrogate key (YYYYMMDD)
        $dateStr = $sale['order_date'];
        $timeHelper = strtotime($dateStr);
        $time_key = (int)date('Ymd', $timeHelper);
        
        // Populate dim_time indices incrementally
        $insertTime->execute([
            ':time_key'     => $time_key,
            ':full_date'    => $dateStr,
            ':day_of_week'  => date('l', $timeHelper),
            ':day_of_month' => (int)date('d', $timeHelper),
            ':month_name'   => date('F', $timeHelper),
            ':quarter'      => (int)ceil(date('m', $timeHelper) / 3),
            ':year'         => (int)date('Y', $timeHelper)
        ]);
        
        // LOAD Phase: Ingest entry inside central Fact Table
        $insertFact->execute([
            ':cust_id'    => $sale['customer_id'],
            ':prod_id'    => $sale['product_id'],
            ':time_key'   => $time_key,
            ':quantity'   => $sale['quantity'],
            ':unit_price' => $sale['unit_price'],
            ':cost_price' => $sale['cost_price'],
            ':revenue'    => $sale['revenue'],
            ':cost'       => $sale['cost'],
            ':profit'     => $sale['profit']
        ]);
        $factCounter++;
    }
    
    // Commit the single massive database stream
    $pdo->commit();
    
    $duration = round(microtime(true) - $startTime, 4);
    echo "=== ETL Pipeline Finished with 100% Success! ===\\n";
    echo "Committed target dimensions correctly. Saved \${factCounter} ledger transactions inside fact_sales in \${duration} seconds.\\n";

} catch (Exception $e) {
    // Revert resource footprints upon errors
    $pdo->rollBack();
    echo "!!! CRITICAL FAIL DURING ETL PROCESS Execution !!!\\n";
    echo "Diagnostic Details: " . $e->getMessage() . "\\n";
}
?>`;

export const phpApiDashboardCode = `<?php
/**
 * api_dashboard.php
 * Outputs aggregate dimension summaries, monthly sales, and custom slices in structured JSON format.
 * Designed as a stateless analytical REST endpoint for fast frontend UI mapping.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Enable cross-origin resource sharing (CORS)

require_once 'db_connect.php';

try {
    $response = [
        'status' => 'success',
        'generated_at' => date('Y-m-d H:i:s'),
        'data' => []
    ];
    
    // 1. High-Level Performance Metrics
    $metricsSql = "
        SELECT 
            SUM(revenue) as total_revenue,
            SUM(cost) as total_cost,
            SUM(profit) as total_profit,
            COUNT(sale_id) as total_sales_count,
            ROUND((SUM(profit) / SUM(revenue)) * 100, 2) as margin_percent
        FROM fact_sales
    ";
    $response['data']['metrics'] = $pdo->query($metricsSql)->fetch();

    // 2. Customer Loyalty Segments RFM Analysis
    $tiersSql = "
        SELECT 
            dc.tier,
            COUNT(DISTINCT dc.customer_id) as customer_count,
            SUM(fs.revenue) as aggregate_spending,
            ROUND(AVG(fs.revenue), 2) as average_order_value
        FROM fact_sales fs
        JOIN dim_customers dc ON fs.customer_key = dc.customer_key
        GROUP BY dc.tier
        ORDER BY aggregate_spending DESC
    ";
    $response['data']['customer_segments'] = $pdo->query($tiersSql)->fetchAll();

    // 3. Time Series Monthly Trend Analysis
    $trendSql = "
        SELECT 
            dt.year,
            dt.month_name,
            SUM(fs.revenue) as monthly_revenue,
            SUM(fs.profit) as monthly_profit
        FROM fact_sales fs
        JOIN dim_time dt ON fs.time_key = dt.time_key
        GROUP BY dt.year, dt.month_name
        ORDER BY MIN(fs.time_key)
    ";
    $response['data']['monthly_trends'] = $pdo->query($trendSql)->fetchAll();

    // 4. Category Classification Slices
    $categoriesSql = "
        SELECT 
            dp.category,
            SUM(fs.quantity) as items_sold,
            SUM(fs.revenue) as segment_revenue,
            SUM(fs.profit) as segment_profit
        FROM fact_sales fs
        JOIN dim_products dp ON fs.product_key = dp.product_key
        GROUP BY dp.category
        ORDER BY segment_profit DESC
    ";
    $response['data']['category_performance'] = $pdo->query($categoriesSql)->fetchAll();

    // Export output in JSON format
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error, analytics fetch operation collapsed: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>`;

export const mysqlSchemaCode = `-- =========================================================================
-- COMPLETE DATA WAREHOUSE DDL SCHEMA (OLTP Staging & OLAP Star Schema)
-- Suitable for Postgres or MySQL educational environments.
-- Combines normalized transactional staging schemas with optimized Star Tables.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS sales_data_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sales_data_warehouse;

-- -------------------------------------------------------------------------
-- PART 1: Source OLTP Systems (Raw Ingestion Staging Layer)
-- -------------------------------------------------------------------------

-- 1.1 Staging Customer Directory
CREATE TABLE IF NOT EXISTS oltp_customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    age INT,
    created_at DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.2 Staging Product Catalogue
CREATE TABLE IF NOT EXISTS oltp_products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.3 Staging Main Order Ledger Headers
CREATE TABLE IF NOT EXISTS oltp_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    FOREIGN KEY (customer_id) REFERENCES oltp_customers(customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.4 Staging Transaction Order Details
CREATE TABLE IF NOT EXISTS oltp_order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES oltp_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES oltp_products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- -------------------------------------------------------------------------
-- PART 2: Target OLAP Data Warehouse (Dimensional Star Schema Tables)
-- -------------------------------------------------------------------------

-- 2.1 Mapped Customer Dimension (dim_customers)
CREATE TABLE IF NOT EXISTS dim_customers (
    customer_key INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNIQUE NOT NULL, -- Natural key pointing to primary oltp_customers database
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'Standard', -- scored dynamically: Standard, Silver, Gold, Platinum
    registration_year INT NOT NULL,
    INDEX idx_cust_tier (tier),
    INDEX idx_cust_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.2 Mapped Product Dimension (dim_products)
CREATE TABLE IF NOT EXISTS dim_products (
    product_key INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNIQUE NOT NULL, -- Natural Key
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    INDEX idx_prod_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.3 Calendar Time Dimension (dim_time)
CREATE TABLE IF NOT EXISTS dim_time (
    time_key INT PRIMARY KEY, -- surrogate integer representing dates: eg. YYYYMMDD
    full_date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    day_of_month INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL,
    INDEX idx_time_month_year (year, month_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.4 Central Fact Table (fact_sales)
CREATE TABLE IF NOT EXISTS fact_sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_key INT NOT NULL,
    product_key INT NOT NULL,
    time_key INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,     -- Precomputed: quantity * unit_price
    cost DECIMAL(10,2) NOT NULL,        -- Precomputed: quantity * cost_price
    profit DECIMAL(10,2) NOT NULL,      -- Mapped margins: revenue - cost
    discount DECIMAL(10,2) DEFAULT 0.00,
    
    FOREIGN KEY (customer_key) REFERENCES dim_customers(customer_key) ON DELETE RESTRICT,
    FOREIGN KEY (product_key) REFERENCES dim_products(product_key) ON DELETE RESTRICT,
    FOREIGN KEY (time_key) REFERENCES dim_time(time_key) ON DELETE RESTRICT,
    
    -- Compound indices optimized for Star Schema multi-table joins
    INDEX idx_fact_joins (customer_key, product_key, time_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------------
-- PART 3: Seed Data (Sample Transactions Seeding OLTP Layer)
-- -------------------------------------------------------------------------

INSERT INTO oltp_customers (customer_id, name, email, city, age, created_at) VALUES
(1, 'Somchai Meedee', 'somchai@email.com', 'Bangkok', 34, '2026-01-05'),
(2, 'Wipaporn Raksuai', 'wipaporn@email.com', 'Chiang Mai', 28, '2026-01-10'),
(3, 'Thanaphol Submak', 'thanaphol@email.com', 'Nonthaburi', 45, '2026-01-15'),
(4, 'Oranong Jaiyen', 'ononong@email.com', 'Chonburi', 31, '2026-02-02'),
(5, 'Kiatisak Poonpol', 'kiatisak@email.com', 'Khon Kaen', 24, '2026-02-18');

INSERT INTO oltp_products (product_id, name, category, unit_price, cost_price) VALUES
(101, 'Smart TV 55\"', 'Electronics', 18500.00, 13500.00),
(102, 'Wireless Headphones', 'Electronics', 3200.00, 2100.00),
(103, 'Microwave Oven', 'Home Appliance', 4500.00, 3100.00);

INSERT INTO oltp_orders (order_id, customer_id, order_date, status) VALUES
(1001, 1, '2026-01-12', 'Completed'),
(1002, 2, '2026-01-15', 'Completed'),
(1003, 3, '2026-01-22', 'Completed');

INSERT INTO oltp_order_items (order_id, product_id, quantity, price) VALUES
(1001, 101, 1, 18500.00),
(1001, 102, 1, 3200.00),
(1002, 103, 1, 4500.00),
(1003, 101, 1, 18500.00);
`;
