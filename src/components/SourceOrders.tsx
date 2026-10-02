import React, { useCallback, useEffect, useState } from "react";
import { ChevronRight, Database, PlusCircle, ShoppingCart, Trash2, UserPlus, PackagePlus } from "lucide-react";
import { api, money, SourceOptions } from "../api";

interface SourceOrdersProps {
  /** Called after the source data changed, so the dashboard can reload. */
  onChanged: () => void;
}

type Message = { ok: boolean; text: string } | null;

// Source system (schema oltp) in SQL Server: customers, products and orders.
// New data shows up in the Star Schema after the next ETL run.
export default function SourceOrders({ onChanged }: SourceOrdersProps) {
  const [options, setOptions] = useState<SourceOptions | null>(null);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState({ name: "", email: "", city: "", age: 30 });
  const [product, setProduct] = useState({ name: "", category: "", unitPrice: 0, costPrice: 0 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const loadOptions = useCallback(async () => {
    try {
      const o = await api.sourceOptions();
      setOptions(o);
      setCustomerId((current) => (o.customers.some((c) => c.id === current) ? current : o.customers[0]?.id ?? ""));
      setProductId((current) => (o.products.some((p) => p.id === current) ? current : o.products[0]?.id ?? ""));
    } catch (err: any) {
      setMessage({ ok: false, text: err.message });
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const run = async (work: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ ok: true, text: await work() });
      await loadOptions();
      onChanged();
    } catch (err: any) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const selectedProduct = options?.products.find((p) => p.id === productId);
  const hasMasterData = !!options && options.customers.length > 0 && options.products.length > 0;

  const saveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId === "" || productId === "") return;
    run(async () => {
      const order = await api.addOrder({ customerId, orderDate, items: [{ productId, quantity }] });
      return `Order #${order.orderId} saved (${money(order.total)}). Run the ETL to load it into the warehouse.`;
    });
  };

  const saveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const c = await api.addCustomer(customer);
      setCustomer({ name: "", email: "", city: "", age: 30 });
      setCustomerId(c.id);
      return `Customer #${c.id} ${c.name} added.`;
    });
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const p = await api.addProduct(product);
      setProduct({ name: "", category: "", unitPrice: 0, costPrice: 0 });
      setProductId(p.id);
      return `Product #${p.id} ${p.name} added.`;
    });
  };

  const loadDemo = () => {
    if (!window.confirm("Replace ALL data with the demo data set (10 customers, 9 products, 25 orders)?")) return;
    run(async () => {
      await api.resetSource();
      return "Demo data loaded. Run the ETL to build the warehouse.";
    });
  };

  const clearAll = () => {
    if (!window.confirm("Delete ALL customers, products, orders and the warehouse? This cannot be undone.")) return;
    run(async () => {
      await api.clearSource();
      return "All data deleted.";
    });
  };

  const field = "w-full bg-subtle border border-transparent text-ink text-sm px-3.5 py-2.5 rounded-xl outline-none transition-colors focus:border-accent focus:bg-surface disabled:opacity-60";
  const label = "flex flex-col gap-1.5 text-xs font-medium text-muted";
  const secondaryButton = "inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-ink hover:bg-subtle disabled:opacity-50 cursor-pointer shrink-0 transition-colors";
  const dangerButton = "inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 cursor-pointer shrink-0 transition-colors";
  const primaryButton = "inline-flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-strong text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 cursor-pointer transition-colors";

  return (
    <section className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">Source system <span className="font-mono text-sm font-normal text-muted">oltp</span></h2>
            <p className="text-sm text-muted mt-0.5">
              Add customers, products and orders, then run the ETL above to see them on the dashboard.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button type="button" onClick={loadDemo} disabled={busy} className={secondaryButton}>
            <Database className="w-3.5 h-3.5" />
            Load demo data
          </button>
          <button type="button" onClick={clearAll} disabled={busy} className={dangerButton}>
            <Trash2 className="w-3.5 h-3.5" />
            Clear all data
          </button>
        </div>
      </div>

      {options && !hasMasterData && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-sm text-amber-800">
          No {options.customers.length === 0 ? "customers" : "products"} yet. Add them below before recording an order.
        </p>
      )}

      <form onSubmit={saveOrder} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <label className={label}>
          Customer
          <select className={field} value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))} disabled={!hasMasterData}>
            {options?.customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Product
          <select className={field} value={productId} onChange={(e) => setProductId(Number(e.target.value))} disabled={!hasMasterData}>
            {options?.products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {money(p.unitPrice)}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>
            Qty
            <input className={field} type="number" min={1} max={100} value={quantity}
                   onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
          </label>
          <label className={label}>
            Date
            <input className={field} type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
          </label>
        </div>
        <button type="submit" disabled={busy || !hasMasterData} className={primaryButton}>
          <PlusCircle className="w-4 h-4" />
          Save order {selectedProduct ? `(${money(selectedProduct.unitPrice * quantity)})` : ""}
        </button>
      </form>

      <details className="group border-t border-line pt-4">
        <summary className="flex items-center gap-2 text-sm font-semibold text-accent cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" aria-hidden="true" />
          Add a new customer or product
        </summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
          <form onSubmit={saveCustomer} className="space-y-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-accent" aria-hidden="true" /> New customer
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>Name<input className={field} value={customer.name} maxLength={100} required
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></label>
              <label className={label}>E-mail<input className={field} type="email" value={customer.email} maxLength={200} required
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></label>
              <label className={label}>City<input className={field} value={customer.city} maxLength={100} required
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })} /></label>
              <label className={label}>Age<input className={field} type="number" min={1} max={120} value={customer.age} required
                onChange={(e) => setCustomer({ ...customer, age: Number(e.target.value) })} /></label>
            </div>
            <button type="submit" disabled={busy} className={secondaryButton}>
              <PlusCircle className="w-3.5 h-3.5" /> Add customer
            </button>
          </form>

          <form onSubmit={saveProduct} className="space-y-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-accent" aria-hidden="true" /> New product
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>Name<input className={field} value={product.name} maxLength={200} required
                onChange={(e) => setProduct({ ...product, name: e.target.value })} /></label>
              <label className={label}>Category<input className={field} value={product.category} maxLength={100} required
                onChange={(e) => setProduct({ ...product, category: e.target.value })} /></label>
              <label className={label}>Unit price<input className={field} type="number" min={0} step="0.01" value={product.unitPrice} required
                onChange={(e) => setProduct({ ...product, unitPrice: Number(e.target.value) })} /></label>
              <label className={label}>Cost price<input className={field} type="number" min={0} step="0.01" value={product.costPrice} required
                onChange={(e) => setProduct({ ...product, costPrice: Number(e.target.value) })} /></label>
            </div>
            <button type="submit" disabled={busy} className={secondaryButton}>
              <PlusCircle className="w-3.5 h-3.5" /> Add product
            </button>
          </form>
        </div>
      </details>

      {message && (
        <p className={`rounded-xl px-3.5 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
