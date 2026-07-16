"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Image as ImageIcon, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requestAdminJson } from "@/lib/admin-api-client";
import type { AdminCategory, AdminStatus } from "@/types/admin";

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: string;
  sortOrder: string;
  status: AdminStatus;
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  image: "/images/store-interior.png",
  productCount: "0",
  sortOrder: "1",
  status: "Published"
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
    status: category.status
  };
}

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const [categories, setCategories] = useState(() => [...initialCategories].sort((a, b) => a.sortOrder - b.sortOrder));
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm);

  async function saveCategory() {
    const category: AdminCategory = {
      id: form.id ?? `cat-${Date.now()}`,
      name: form.name.trim() || "Untitled Category",
      slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description.trim(),
      image: form.image.trim() || "/images/store-interior.png",
      productCount: Number(form.productCount) || 0,
      sortOrder: Number(form.sortOrder) || categories.length + 1,
      status: form.status
    };

    try {
      const { category: savedCategory } = await requestAdminJson<{ category: AdminCategory }>(form.id ? `/api/admin/categories/${encodeURIComponent(category.id)}` : "/api/admin/categories", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(category)
      });

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
    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
      setCategories((current) => normalizeOrder(current.filter((item) => item.id !== categoryId)));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete category.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Version 2 taxonomy controls with image placeholders, product counts, and reorderable merchandising order."
        action={
          <button
            type="button"
            onClick={() => setForm({ ...emptyCategoryForm, sortOrder: String(categories.length + 1) })}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Category
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Slug</th>
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
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-mist">
                          <Image src={category.image} alt={category.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{category.name}</p>
                          <p className="mt-1 max-w-md text-sm text-stone">{category.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone">{category.slug}</td>
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

        <aside className="border border-line bg-white p-5">
          <div className="border-b border-line pb-5">
            <p className={labelClass}>Category form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit category" : "Create category"}</h2>
          </div>
          <div className="mt-5 space-y-5">
            <div className="border border-dashed border-line bg-mist p-5">
              <div className="relative aspect-[16/10] overflow-hidden bg-white">
                {form.image ? (
                  <Image src={form.image} alt="Category preview" fill sizes="360px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone">
                    <ImageIcon size={24} strokeWidth={1.6} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-stone">
                <Upload size={16} strokeWidth={1.7} />
                Category image placeholder for future upload integration.
              </div>
            </div>
            <Field label="Image URL">
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className={inputClass} />
            </Field>
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Product Count">
                <input type="number" value={form.productCount} onChange={(event) => setForm((current) => ({ ...current, productCount: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))} className={inputClass}>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </Field>
            </div>
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
