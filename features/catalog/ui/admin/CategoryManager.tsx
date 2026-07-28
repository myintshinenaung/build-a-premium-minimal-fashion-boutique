"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requestAdminJson } from "@/features/identity/client";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import type { AdminCategory, AdminStatus } from "@/types/admin";

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: string;
  sortOrder: string;
  storeId: string;
  status: AdminStatus;
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  image: "",
  productCount: "0",
  sortOrder: "1",
  storeId: ACTIVE_PLATFORM_STORE_ID,
  status: "Draft"
};

function categoryToForm(category: AdminCategory): CategoryFormState {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    productCount: String(category.productCount),
    sortOrder: String(category.sortOrder),
    storeId: category.storeId,
    status: category.status
  };
}

function storeLabel(storeId: string) {
  return PLATFORM_STORES.find((store) => store.id === storeId)?.label ?? storeId;
}

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const [categories, setCategories] = useState(() => [...initialCategories].sort((a, b) => a.sortOrder - b.sortOrder));
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm);

  const dailyOutfitCategories = useMemo(
    () => categories.filter((category) => category.storeId === ACTIVE_PLATFORM_STORE_ID),
    [categories]
  );

  async function saveCategory() {
    if (!form.image.trim()) {
      window.alert("Category icon / image is required.");
      return;
    }

    const category: AdminCategory = {
      id: form.id ?? `cat-${Date.now()}`,
      name: form.name.trim() || "Untitled Category",
      slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description.trim(),
      image: form.image.trim(),
      productCount: Number(form.productCount) || 0,
      sortOrder: Number(form.sortOrder) || categories.length + 1,
      storeId: form.storeId,
      status: form.status
    };

    try {
      const { category: savedCategory } = await requestAdminJson<{ category: AdminCategory }>(
        form.id ? `/api/admin/categories/${encodeURIComponent(category.id)}` : "/api/admin/categories",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(category)
        }
      );

      setCategories((current) => {
        const exists = current.some((item) => item.id === savedCategory.id);
        const next = exists ? current.map((item) => (item.id === savedCategory.id ? savedCategory : item)) : [...current, savedCategory];
        return normalizeOrder(next.sort((a, b) => a.sortOrder - b.sortOrder));
      });
      setForm(emptyCategoryForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save category.");
    }
  }

  async function moveCategory(categoryId: string, direction: -1 | 1) {
    const nextCategories = normalizeOrder(
      (() => {
        const index = categories.findIndex((category) => category.id === categoryId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) return categories;
        const next = [...categories];
        const [category] = next.splice(index, 1);
        next.splice(targetIndex, 0, category);
        return next;
      })()
    );

    try {
      const { categories: savedCategories } = await requestAdminJson<{ categories: AdminCategory[] }>("/api/admin/categories/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids: nextCategories.map((category) => category.id) })
      });

      setCategories(savedCategories);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to reorder categories.");
    }
  }

  async function deleteCategory(categoryId: string) {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
      setCategories((current) => normalizeOrder(current.filter((item) => item.id !== categoryId)));
      if (form.id === categoryId) {
        setForm(emptyCategoryForm);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete category.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Category Rail Manager"
        description="Control homepage category icons — image, name, display order, store assignment, and active state."
        action={
          <button
            type="button"
            onClick={() => setForm({ ...emptyCategoryForm, sortOrder: String(dailyOutfitCategories.length + 1) })}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Category
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <p className={labelClass}>Daily Outfit category rail</p>
            <p className="mt-1 text-sm text-stone">{dailyOutfitCategories.length} categories configured for the active storefront</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Store</th>
                  <th className="px-5 py-4 font-medium">Products</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="min-w-6 text-sm text-stone">{category.sortOrder}</span>
                        <button
                          type="button"
                          onClick={() => moveCategory(category.id, -1)}
                          disabled={index === 0}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${category.name} up`}
                        >
                          <ArrowUp size={15} strokeWidth={1.7} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCategory(category.id, 1)}
                          disabled={index === categories.length - 1}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${category.name} down`}
                        >
                          <ArrowDown size={15} strokeWidth={1.7} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-mist ring-1 ring-line">
                          {category.image ? (
                            <Image src={category.image} alt={category.name} fill sizes="64px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{category.name}</p>
                          <p className="mt-1 text-xs text-stone">{category.slug}</p>
                          {category.description ? <p className="mt-1 max-w-md text-sm text-stone">{category.description}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone">{storeLabel(category.storeId)}</td>
                    <td className="px-5 py-4 text-stone">{category.productCount}</td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={category.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(categoryToForm(category))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil size={16} strokeWidth={1.7} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(category.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 size={16} strokeWidth={1.7} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="border border-line bg-white p-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border-b border-line pb-5">
            <p className={labelClass}>Category form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit category" : "Create category"}</h2>
          </div>
          <div className="mt-5 space-y-5">
            <Field label="Icon / image URL">
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                className={inputClass}
                placeholder="/images/your-category.png or full URL"
                required
              />
            </Field>

            {form.image ? (
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                <Image src={form.image} alt="Category preview" fill sizes="440px" className="object-cover" />
              </div>
            ) : null}

            <Field label="Name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className={`${inputClass} min-h-28 resize-y`}
              />
            </Field>

            <Field label="Store">
              <select
                value={form.storeId}
                onChange={(event) => setForm((current) => ({ ...current, storeId: event.target.value }))}
                className={inputClass}
              >
                {PLATFORM_STORES.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Product count">
                <input
                  type="number"
                  value={form.productCount}
                  onChange={(event) => setForm((current) => ({ ...current, productCount: event.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="Display order">
                <input
                  type="number"
                  min={1}
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Active / inactive">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))}
                className={inputClass}
              >
                <option value="Published">Active (Published)</option>
                <option value="Draft">Inactive (Draft)</option>
              </select>
            </Field>

            <button
              type="button"
              onClick={saveCategory}
              className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
            >
              <Save size={17} strokeWidth={1.7} />
              Save Category
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function normalizeOrder(categories: AdminCategory[]) {
  return categories.map((category, index) => ({ ...category, sortOrder: index + 1 }));
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
