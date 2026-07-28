"use client";

import { ArrowDown, ArrowUp, Layers, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { requestAdminJson } from "@/features/identity/client";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import type { AdminProduct, AdminStatus } from "@/types/admin";
import type { AdminFeaturedCollection } from "@/types/featured-collection";

type CollectionItemForm = {
  id?: string;
  productId: string;
  sortOrder: string;
};

type CollectionFormState = {
  id?: string;
  storeId: string;
  title: string;
  subtitle: string;
  coverImage: string;
  buttonText: string;
  buttonUrl: string;
  sortOrder: string;
  startsAt: string;
  endsAt: string;
  status: AdminStatus;
  items: CollectionItemForm[];
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyItem: CollectionItemForm = {
  productId: "",
  sortOrder: "0"
};

const emptyForm: CollectionFormState = {
  storeId: ACTIVE_PLATFORM_STORE_ID,
  title: "",
  subtitle: "",
  coverImage: "",
  buttonText: "",
  buttonUrl: "",
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

function collectionToForm(collection: AdminFeaturedCollection): CollectionFormState {
  return {
    id: collection.id,
    storeId: collection.storeId,
    title: collection.title,
    subtitle: collection.subtitle,
    coverImage: collection.coverImage,
    buttonText: collection.buttonText,
    buttonUrl: collection.buttonUrl,
    sortOrder: String(collection.sortOrder),
    startsAt: toDatetimeLocalValue(collection.startsAt),
    endsAt: toDatetimeLocalValue(collection.endsAt),
    status: collection.status,
    items: collection.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      sortOrder: String(item.sortOrder)
    }))
  };
}

function storeLabel(storeId: string) {
  return PLATFORM_STORES.find((store) => store.id === storeId)?.label ?? storeId;
}

export function FeaturedCollectionManager({
  initialCollections,
  products
}: {
  initialCollections: AdminFeaturedCollection[];
  products: AdminProduct[];
}) {
  const [collections, setCollections] = useState(initialCollections);
  const [form, setForm] = useState<CollectionFormState>(emptyForm);
  const [selectedProductId, setSelectedProductId] = useState("");

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === "Published").sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const dailyOutfitCollections = useMemo(
    () => collections.filter((collection) => collection.storeId === ACTIVE_PLATFORM_STORE_ID),
    [collections]
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

  async function saveCollection() {
    if (!form.title.trim()) {
      window.alert("Title is required.");
      return;
    }

    if (!form.coverImage.trim()) {
      window.alert("Cover image is required.");
      return;
    }

    const payload = {
      id: form.id,
      storeId: form.storeId,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      coverImage: form.coverImage.trim(),
      buttonText: form.buttonText.trim(),
      buttonUrl: form.buttonUrl.trim(),
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
      const { collection } = await requestAdminJson<{ collection: AdminFeaturedCollection }>(
        form.id ? `/api/admin/featured-collections/${encodeURIComponent(form.id)}` : "/api/admin/featured-collections",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setCollections((current) => {
        const exists = current.some((entry) => entry.id === collection.id);
        return exists
          ? current.map((entry) => (entry.id === collection.id ? collection : entry))
          : [collection, ...current];
      });
      setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save featured collection.");
    }
  }

  async function deleteCollection(id: string) {
    if (!window.confirm("Delete this featured collection?")) return;

    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/featured-collections/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      setCollections((current) => current.filter((entry) => entry.id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete featured collection.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Featured Collection Manager"
        description="Control homepage featured collection cards — cover image, copy, CTA, products, schedule, display order, and active state."
        action={
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Collection
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          <article className="border border-line bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Daily Outfit collections</p>
                <h2 className="mt-2 text-xl font-medium text-ink">{dailyOutfitCollections.length} collection(s)</h2>
              </div>
              <Layers size={20} className="text-ink" strokeWidth={1.7} />
            </div>

            {collections.length === 0 ? (
              <p className="text-sm leading-6 text-stone">No featured collections yet. Create one using the form.</p>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <article key={collection.id} className="border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-4">
                        {collection.coverImage ? (
                          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-line">
                            <MarketplaceImage
                              src={collection.coverImage}
                              alt={collection.title}
                              className="h-full w-full"
                              sizes="112px"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-ink">{collection.title || "Untitled collection"}</h3>
                            <AdminStatusBadge status={collection.status} />
                            <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone">
                              {storeLabel(collection.storeId)}
                            </span>
                          </div>
                          {collection.subtitle ? <p className="mt-1 text-sm text-stone">{collection.subtitle}</p> : null}
                          <p className="mt-2 text-xs text-stone">
                            Order {collection.sortOrder} · {collection.items.length} product(s)
                            {collection.buttonText ? ` · CTA: ${collection.buttonText}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(collectionToForm(collection))}
                          className="rounded-full px-3 py-2 text-sm text-ink transition-colors hover:bg-mist"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCollection(collection.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Delete ${collection.title}`}
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
            <p className={labelClass}>Collection form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit collection" : "Create collection"}</h2>
          </div>

          <div className="mt-5 space-y-5">
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} className={inputClass} required />
            </Field>
            <Field label="Subtitle">
              <textarea
                value={form.subtitle}
                onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </Field>
            <Field label="Cover image">
              <input
                value={form.coverImage}
                onChange={(e) => setForm((c) => ({ ...c, coverImage: e.target.value }))}
                className={inputClass}
                placeholder="/images/your-collection.png or full URL"
                required
              />
            </Field>
            {form.coverImage ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <MarketplaceImage src={form.coverImage} alt="Cover preview" className="aspect-[16/10]" sizes="440px" />
              </div>
            ) : null}
            <Field label="Button text">
              <input value={form.buttonText} onChange={(e) => setForm((c) => ({ ...c, buttonText: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Button URL">
              <input value={form.buttonUrl} onChange={(e) => setForm((c) => ({ ...c, buttonUrl: e.target.value }))} className={inputClass} placeholder="/categories/dresses" />
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
                      <div className="mt-3">
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

            <button type="button" onClick={saveCollection} className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone">
              <Save size={17} strokeWidth={1.7} />
              Save Collection
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
