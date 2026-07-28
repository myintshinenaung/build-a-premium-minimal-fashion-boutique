"use client";

import { Copy, GripVertical, Plus, Rows3, Save, Trash2 } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requestAdminJson } from "@/features/identity/client";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import type { AdminProduct, AdminStatus } from "@/types/admin";
import type { AdminProductRail } from "@/types/product-rail";

type RailItemForm = {
  id?: string;
  productId: string;
  sortOrder: string;
};

type RailFormState = {
  id?: string;
  storeId: string;
  title: string;
  subtitle: string;
  badgeText: string;
  description: string;
  sortOrder: string;
  startsAt: string;
  endsAt: string;
  status: AdminStatus;
  items: RailItemForm[];
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyItem: RailItemForm = {
  productId: "",
  sortOrder: "0"
};

const emptyForm: RailFormState = {
  storeId: ACTIVE_PLATFORM_STORE_ID,
  title: "",
  subtitle: "",
  badgeText: "",
  description: "",
  sortOrder: "0",
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

function railToForm(rail: AdminProductRail): RailFormState {
  return {
    id: rail.id,
    storeId: rail.storeId,
    title: rail.title,
    subtitle: rail.subtitle,
    badgeText: rail.badgeText,
    description: rail.description,
    sortOrder: String(rail.sortOrder),
    startsAt: toDatetimeLocalValue(rail.startsAt),
    endsAt: toDatetimeLocalValue(rail.endsAt),
    status: rail.status,
    items: rail.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      sortOrder: String(item.sortOrder)
    }))
  };
}

function storeLabel(storeId: string) {
  return PLATFORM_STORES.find((store) => store.id === storeId)?.label ?? storeId;
}

function reorderItems(items: RailItemForm[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [moved] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, moved);
  return nextItems.map((entry, order) => ({ ...entry, sortOrder: String(order) }));
}

export function ProductRailManager({
  initialRails,
  products
}: {
  initialRails: AdminProductRail[];
  products: AdminProduct[];
}) {
  const [rails, setRails] = useState(initialRails);
  const [form, setForm] = useState<RailFormState>(emptyForm);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "Published").sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const dailyOutfitRails = useMemo(
    () => rails.filter((rail) => rail.storeId === ACTIVE_PLATFORM_STORE_ID),
    [rails]
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

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setForm((current) => ({
      ...current,
      items: reorderItems(current.items, dragIndex, index)
    }));
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function saveRail() {
    if (!form.title.trim()) {
      window.alert("Title is required.");
      return;
    }

    const payload = {
      id: form.id,
      storeId: form.storeId,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      badgeText: form.badgeText.trim(),
      description: form.description.trim(),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      startsAt: fromDatetimeLocalValue(form.startsAt),
      endsAt: fromDatetimeLocalValue(form.endsAt),
      status: form.status,
      items: form.items
        .filter((item) => item.productId)
        .map((item, index) => ({
          id: item.id,
          productId: item.productId,
          sortOrder: Number.parseInt(item.sortOrder, 10) || index
        }))
    };

    try {
      const { rail } = await requestAdminJson<{ rail: AdminProductRail }>(
        form.id ? `/api/admin/product-rails/${encodeURIComponent(form.id)}` : "/api/admin/product-rails",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setRails((current) => {
        const exists = current.some((entry) => entry.id === rail.id);
        return exists ? current.map((entry) => (entry.id === rail.id ? rail : entry)) : [rail, ...current];
      });
      setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save product rail.");
    }
  }

  async function deleteRail(id: string) {
    if (!window.confirm("Delete this product rail?")) return;

    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/product-rails/${encodeURIComponent(id)}`, { method: "DELETE" });
      setRails((current) => current.filter((entry) => entry.id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete product rail.");
    }
  }

  async function duplicateRail(id: string) {
    try {
      const { rail } = await requestAdminJson<{ rail: AdminProductRail }>(
        `/api/admin/product-rails/${encodeURIComponent(id)}/duplicate`,
        { method: "POST" }
      );
      setRails((current) => [rail, ...current]);
      setForm(railToForm(rail));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to duplicate product rail.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Product Rail Manager"
        description="Control every homepage product rail — titles, badges, product lineup, schedule, display order, and active state."
        action={
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Rail
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          <article className="border border-line bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Daily Outfit rails</p>
                <h2 className="mt-2 text-xl font-medium text-ink">{dailyOutfitRails.length} rail(s)</h2>
              </div>
              <Rows3 size={20} className="text-ink" strokeWidth={1.7} />
            </div>

            {rails.length === 0 ? (
              <p className="text-sm leading-6 text-stone">No product rails yet. Create one using the form.</p>
            ) : (
              <div className="space-y-4">
                {rails.map((rail) => (
                  <article key={rail.id} className="border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-ink">{rail.title || "Untitled rail"}</h3>
                          <AdminStatusBadge status={rail.status} />
                          <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone">
                            {storeLabel(rail.storeId)}
                          </span>
                          {rail.badgeText ? (
                            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                              {rail.badgeText}
                            </span>
                          ) : null}
                        </div>
                        {rail.subtitle ? <p className="mt-1 text-sm text-stone">{rail.subtitle}</p> : null}
                        <p className="mt-2 text-xs text-stone">
                          Order {rail.sortOrder} · {rail.items.length} product(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(railToForm(rail))}
                          className="rounded-full px-3 py-2 text-sm text-ink transition-colors hover:bg-mist"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateRail(rail.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Duplicate ${rail.title}`}
                        >
                          <Copy size={16} strokeWidth={1.7} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRail(rail.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Delete ${rail.title}`}
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
            <p className={labelClass}>Rail form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit rail" : "Create rail"}</h2>
          </div>

          <div className="mt-5 space-y-5">
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} className={inputClass} required />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Badge">
              <input value={form.badgeText} onChange={(e) => setForm((c) => ({ ...c, badgeText: e.target.value }))} className={inputClass} placeholder="New, Trending, etc." />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </Field>
            <Field label="Display order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((c) => ({ ...c, sortOrder: e.target.value }))}
                className={inputClass}
              />
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
                <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((c) => ({ ...c, endsAt: e.target.value }))} className={inputClass} />
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
              <p className="mt-1 text-xs text-stone">Drag rows to reorder lineup.</p>
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
                    <div
                      key={`${item.productId}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(event) => handleDragOver(event, index)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-xl border border-line p-3 transition-colors ${dragIndex === index ? "bg-mist" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-full text-stone active:cursor-grabbing">
                            <GripVertical size={16} />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-ink">{product?.name ?? item.productId}</p>
                            <p className="text-xs text-stone">{product?.sku ?? ""}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-mist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={saveRail} className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone">
              <Save size={17} strokeWidth={1.7} />
              Save Rail
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
