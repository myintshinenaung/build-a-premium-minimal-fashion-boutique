"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requestAdminJson } from "@/features/identity/client";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import type { AdminProduct, AdminStatus } from "@/types/admin";
import type { AdminFlashSale } from "@/types/flash-sale";

type FlashSaleItemForm = {
  id?: string;
  productId: string;
  discountPercent: string;
  sortOrder: string;
};

type FlashSaleFormState = {
  id?: string;
  storeId: string;
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText: string;
  startsAt: string;
  endsAt: string;
  status: AdminStatus;
  items: FlashSaleItemForm[];
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyItem: FlashSaleItemForm = {
  productId: "",
  discountPercent: "10",
  sortOrder: "0"
};

const emptyForm: FlashSaleFormState = {
  storeId: ACTIVE_PLATFORM_STORE_ID,
  sectionTitle: "",
  sectionSubtitle: "",
  badgeText: "",
  startsAt: "",
  endsAt: "",
  status: "Draft",
  items: []
};

function toDatetimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function flashSaleToForm(flashSale: AdminFlashSale): FlashSaleFormState {
  return {
    id: flashSale.id,
    storeId: flashSale.storeId,
    sectionTitle: flashSale.sectionTitle,
    sectionSubtitle: flashSale.sectionSubtitle,
    badgeText: flashSale.badgeText,
    startsAt: toDatetimeLocalValue(flashSale.startsAt),
    endsAt: toDatetimeLocalValue(flashSale.endsAt),
    status: flashSale.status,
    items: flashSale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      discountPercent: String(item.discountPercent),
      sortOrder: String(item.sortOrder)
    }))
  };
}

function storeLabel(storeId: string) {
  return PLATFORM_STORES.find((store) => store.id === storeId)?.label ?? storeId;
}

export function FlashSaleManager({
  initialFlashSales,
  products
}: {
  initialFlashSales: AdminFlashSale[];
  products: AdminProduct[];
}) {
  const [flashSales, setFlashSales] = useState(initialFlashSales);
  const [form, setForm] = useState<FlashSaleFormState>(emptyForm);
  const [selectedProductId, setSelectedProductId] = useState("");

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "Published").sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const dailyOutfitSales = useMemo(
    () => flashSales.filter((sale) => sale.storeId === ACTIVE_PLATFORM_STORE_ID),
    [flashSales]
  );

  function addProductToForm() {
    if (!selectedProductId || form.items.some((item) => item.productId === selectedProductId)) {
      return;
    }

    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          ...emptyItem,
          productId: selectedProductId,
          sortOrder: String(current.items.length)
        }
      ]
    }));
    setSelectedProductId("");
  }

  function moveItem(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.items.length) return current;
      const nextItems = [...current.items];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(target, 0, item);
      return {
        ...current,
        items: nextItems.map((entry, order) => ({ ...entry, sortOrder: String(order) }))
      };
    });
  }

  async function saveFlashSale() {
    if (!form.sectionTitle.trim()) {
      window.alert("Section title is required.");
      return;
    }

    if (!form.endsAt.trim()) {
      window.alert("End date is required for the countdown.");
      return;
    }

    const payload = {
      id: form.id,
      storeId: form.storeId,
      sectionTitle: form.sectionTitle.trim(),
      sectionSubtitle: form.sectionSubtitle.trim(),
      badgeText: form.badgeText.trim(),
      startsAt: fromDatetimeLocalValue(form.startsAt),
      endsAt: fromDatetimeLocalValue(form.endsAt),
      status: form.status,
      items: form.items
        .filter((item) => item.productId)
        .map((item, index) => ({
          id: item.id,
          productId: item.productId,
          discountPercent: Number.parseInt(item.discountPercent, 10) || 0,
          sortOrder: Number.parseInt(item.sortOrder, 10) || index
        }))
    };

    try {
      const { flashSale } = await requestAdminJson<{ flashSale: AdminFlashSale }>(
        form.id ? `/api/admin/flash-sales/${encodeURIComponent(form.id)}` : "/api/admin/flash-sales",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setFlashSales((current) => {
        const exists = current.some((entry) => entry.id === flashSale.id);
        return exists ? current.map((entry) => (entry.id === flashSale.id ? flashSale : entry)) : [flashSale, ...current];
      });
      setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save flash sale.");
    }
  }

  async function deleteFlashSale(id: string) {
    if (!window.confirm("Delete this flash sale campaign?")) return;

    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/flash-sales/${encodeURIComponent(id)}`, { method: "DELETE" });
      setFlashSales((current) => current.filter((entry) => entry.id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete flash sale.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Flash Sale Manager"
        description="Control homepage flash sale copy, schedule, discounts, product lineup, and active state."
        action={
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Flash Sale
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          <article className="border border-line bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Daily Outfit flash sale</p>
                <h2 className="mt-2 text-xl font-medium text-ink">{dailyOutfitSales.length} campaign(s)</h2>
              </div>
              <Zap size={20} className="text-ink" strokeWidth={1.7} />
            </div>

            {dailyOutfitSales.length === 0 ? (
              <p className="text-sm leading-6 text-stone">No flash sale campaigns yet. Create one using the form.</p>
            ) : (
              <div className="space-y-4">
                {flashSales.map((sale) => (
                  <article key={sale.id} className="border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-ink">{sale.sectionTitle || "Untitled flash sale"}</h3>
                          <AdminStatusBadge status={sale.status} />
                          <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone">
                            {storeLabel(sale.storeId)}
                          </span>
                        </div>
                        {sale.sectionSubtitle ? <p className="mt-1 text-sm text-stone">{sale.sectionSubtitle}</p> : null}
                        <p className="mt-2 text-xs text-stone">
                          {sale.items.length} product(s) · badge: {sale.badgeText || "—"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(flashSaleToForm(sale))}
                          className="rounded-full px-3 py-2 text-sm text-ink transition-colors hover:bg-mist"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFlashSale(sale.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Delete ${sale.sectionTitle}`}
                        >
                          <Trash2 size={16} strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>

        <aside className="border border-line bg-white p-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border-b border-line pb-5">
            <p className={labelClass}>Flash sale form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit campaign" : "Create campaign"}</h2>
          </div>

          <div className="mt-5 space-y-5">
            <Field label="Section title">
              <input value={form.sectionTitle} onChange={(e) => setForm((c) => ({ ...c, sectionTitle: e.target.value }))} className={inputClass} required />
            </Field>
            <Field label="Section subtitle">
              <input value={form.sectionSubtitle} onChange={(e) => setForm((c) => ({ ...c, sectionSubtitle: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Badge text">
              <input value={form.badgeText} onChange={(e) => setForm((c) => ({ ...c, badgeText: e.target.value }))} className={inputClass} />
            </Field>

            <Field label="Store">
              <select value={form.storeId} onChange={(e) => setForm((c) => ({ ...c, storeId: e.target.value }))} className={inputClass}>
                {PLATFORM_STORES.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date">
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((c) => ({ ...c, startsAt: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="End date">
                <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((c) => ({ ...c, endsAt: e.target.value }))} className={inputClass} required />
              </Field>
            </div>

            <Field label="Active / inactive">
              <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as AdminStatus }))} className={inputClass}>
                <option value="Published">Active (Published)</option>
                <option value="Draft">Inactive (Draft)</option>
              </select>
            </Field>

            <div className="border-t border-line pt-5">
              <p className={labelClass}>Products</p>
              <div className="mt-3 flex gap-2">
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className={inputClass}>
                  <option value="">Select product</option>
                  {publishedProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addProductToForm} className="shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-white">
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {form.items.map((item, index) => {
                  const product = publishedProducts.find((entry) => entry.id === item.productId);
                  return (
                    <div key={`${item.productId}-${index}`} className="rounded-xl border border-line p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-ink">{product?.name ?? item.productId}</p>
                          <p className="text-xs text-stone">{product?.sku ?? ""}</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-30">
                            <ArrowUp size={14} />
                          </button>
                          <button type="button" onClick={() => moveItem(index, 1)} disabled={index === form.items.length - 1} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-30">
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field label="Discount %">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discountPercent}
                            onChange={(e) =>
                              setForm((c) => ({
                                ...c,
                                items: c.items.map((entry, i) => (i === index ? { ...entry, discountPercent: e.target.value } : entry))
                              }))
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Display order">
                          <input
                            type="number"
                            min={0}
                            value={item.sortOrder}
                            onChange={(e) =>
                              setForm((c) => ({
                                ...c,
                                items: c.items.map((entry, i) => (i === index ? { ...entry, sortOrder: e.target.value } : entry))
                              }))
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={saveFlashSale} className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone">
              <Save size={17} strokeWidth={1.7} />
              Save Flash Sale
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
