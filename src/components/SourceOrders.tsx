import React, { useEffect, useState } from "react";
import { PlusCircle, RotateCcw, ShoppingCart } from "lucide-react";
import { api, money, SourceOptions } from "../api";

interface SourceOrdersProps {
  /** Called after the source data changed, so the dashboard can reload. */
  onChanged: () => void;
}

// Writes new orders into the source tables (oltp.orders / oltp.order_items) in SQL Server.
// They show up in the Star Schema after the next ETL run.
export default function SourceOrders({ onChanged }: SourceOrdersProps) {
  const [options, setOptions] = useState<SourceOptions | null>(null);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.sourceOptions()
      .then((o) => {
        setOptions(o);
        setCustomerId(o.customers[0]?.id ?? "");
        setProductId(o.products[0]?.id ?? "");
      })
      .catch((err) => setMessage({ ok: false, text: err.message }));
  }, []);

  const product = options?.products.find((p) => p.id === productId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId === "" || productId === "") return;
    setBusy(true);
    setMessage(null);
    try {
      const order = await api.addOrder({ customerId, orderDate, items: [{ productId, quantity }] });
      setMessage({ ok: true, text: `Order #${order.orderId} saved (${money(order.total)}). Run the ETL to load it into the warehouse.` });
      onChanged();
    } catch (err: any) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Restore the demo source data and empty the warehouse? New orders will be removed.")) return;
    setBusy(true);
    try {
      await api.resetSource();
      setMessage({ ok: true, text: "Demo data restored. The warehouse is empty until the next ETL run." });
      onChanged();
    } catch (err: any) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full bg-[#0A0A0A] border border-[#262626] text-zinc-200 text-xs px-3 py-2 rounded-none outline-none focus:border-[#D4AF37]/60";

  return (
    <div className="bg-[#141414] p-6 rounded-none border border-[#262626] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-serif italic text-[#D4AF37] tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            New Source Order (oltp.orders)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Record a sale in the source system, then run the ETL above to see it on the dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider border border-[#262626] text-zinc-400 hover:text-zinc-200 hover:bg-[#0F0F0F] disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore demo data
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <label className="space-y-1 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
          Customer
          <select className={field} value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))} disabled={!options}>
            {options?.customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
          Product
          <select className={field} value={productId} onChange={(e) => setProductId(Number(e.target.value))} disabled={!options}>
            {options?.products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {money(p.unitPrice)}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
            Qty
            <input className={field} type="number" min={1} max={100} value={quantity}
                   onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
          </label>
          <label className="space-y-1 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
            Date
            <input className={field} type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy || !options}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-amber-300 text-slate-950 text-[11px] font-bold px-4 py-2.5 rounded-none uppercase font-mono disabled:opacity-50 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Save order {product ? `(${money(product.unitPrice * quantity)})` : ""}
        </button>
      </form>

      {message && (
        <p className={`text-[11px] font-mono ${message.ok ? "text-emerald-400" : "text-red-400"}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
}
