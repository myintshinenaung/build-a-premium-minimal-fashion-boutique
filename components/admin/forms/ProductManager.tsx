"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requestAdminJson } from "@/lib/admin-api-client";
import { formatMmk } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import type { AdminCategory, AdminProduct, AdminStatus } from "@/types/admin";

type ProductFormState = {
  id?: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brand: string;
  priceMmk: string;
  salePriceMmk: string;
  costPriceMmk: string;
  description: string;
  images: string[];
  colors: string;
  sizes: string[];
  stockQuantity: string;
  lowStockWarning: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  onSale: boolean;
  status: AdminStatus;
};

const pageSize = 5;
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

function createEmptyForm(categoryId: string): ProductFormState {
  return {
    name: "",
    sku: "",
    barcode: "",
    categoryId,
    brand: "Atelier Lune",
    priceMmk: "",
    salePriceMmk: "",
    costPriceMmk: "",
    description: "",
    images: ["/images/hero-boutique.png"],
    colors: "Ivory, Black",
    sizes: ["S", "M", "L"],
    stockQuantity: "0",
    lowStockWarning: "5",
    featured: false,
    bestSeller: false,
    newArrival: false,
    onSale: false,
    status: "Draft"
  };
}

function productToForm(product: AdminProduct): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    brand: product.brand,
    priceMmk: String(product.priceMmk),
    salePriceMmk: product.salePriceMmk ? String(product.salePriceMmk) : "",
    costPriceMmk: String(product.costPriceMmk),
    description: product.description,
    images: product.images,
    colors: product.colors.join(", "),
    sizes: product.sizes,
    stockQuantity: String(product.stockQuantity),
    lowStockWarning: String(product.lowStockWarning),
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    onSale: product.onSale,
    status: product.status
  };
}

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type ProductManagerProps = {
  initialProducts: AdminProduct[];
  categories: AdminCategory[];
};

export function ProductManager({ initialProducts, categories }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminStatus>("all");
  const [flagFilter, setFlagFilter] = useState("all");
  const [sort, setSort] = useState("updated-desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [form, setForm] = useState<ProductFormState>(() => createEmptyForm(categories[0]?.id ?? ""));

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const categoryName = categoryNameById.get(product.categoryId) ?? "";
      const haystack = `${product.name} ${product.sku} ${product.barcode} ${product.brand} ${categoryName}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesFlag =
        flagFilter === "all" ||
        (flagFilter === "featured" && product.featured) ||
        (flagFilter === "bestSeller" && product.bestSeller) ||
        (flagFilter === "newArrival" && product.newArrival) ||
        (flagFilter === "onSale" && product.onSale) ||
        (flagFilter === "lowStock" && product.stockQuantity <= product.lowStockWarning);

      return matchesSearch && matchesCategory && matchesStatus && matchesFlag;
    });

    return filtered.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "price-asc") return a.priceMmk - b.priceMmk;
      if (sort === "price-desc") return b.priceMmk - a.priceMmk;
      if (sort === "stock-asc") return a.stockQuantity - b.stockQuantity;
      if (sort === "stock-desc") return b.stockQuantity - a.stockQuantity;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [categoryFilter, categoryNameById, flagFilter, products, query, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = pageProducts.length > 0 && pageProducts.every((product) => selectedIds.includes(product.id));

  function resetPagingAndSelection() {
    setPage(1);
    setSelectedIds([]);
  }

  function openCreateForm() {
    setForm(createEmptyForm(categories[0]?.id ?? ""));
    setImageUrlInput("");
    setIsFormOpen(true);
  }

  function openEditForm(product: AdminProduct) {
    setForm(productToForm(product));
    setImageUrlInput("");
    setIsFormOpen(true);
  }

  async function saveProduct() {
    const product: AdminProduct = {
      id: form.id ?? `prd-${Date.now()}`,
      name: form.name.trim() || "Untitled Product",
      sku: form.sku.trim() || "SKU-DRAFT",
      barcode: form.barcode.trim() || "BARCODE-PENDING",
      categoryId: form.categoryId,
      brand: form.brand.trim() || "Atelier Lune",
      priceMmk: Number(form.priceMmk) || 0,
      salePriceMmk: form.salePriceMmk ? Number(form.salePriceMmk) || 0 : undefined,
      costPriceMmk: Number(form.costPriceMmk) || 0,
      description: form.description.trim(),
      images: form.images.length > 0 ? form.images : ["/images/hero-boutique.png"],
      colors: splitList(form.colors),
      sizes: form.sizes,
      stockQuantity: Number(form.stockQuantity) || 0,
      lowStockWarning: Number(form.lowStockWarning) || 0,
      featured: form.featured,
      bestSeller: form.bestSeller,
      newArrival: form.newArrival,
      onSale: form.onSale,
      status: form.status,
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    try {
      const { product: savedProduct } = await requestAdminJson<{ product: AdminProduct }>(form.id ? `/api/admin/products/${encodeURIComponent(product.id)}` : "/api/admin/products", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(product)
      });

      setProducts((current) => {
        const exists = current.some((item) => item.id === savedProduct.id);
        return exists ? current.map((item) => (item.id === savedProduct.id ? savedProduct : item)) : [savedProduct, ...current];
      });
      setIsFormOpen(false);
      setForm(createEmptyForm(categories[0]?.id ?? ""));
      setSelectedIds([]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save product.");
    }
  }

  async function deleteProduct(productId: string) {
    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== productId));
      setSelectedIds((current) => current.filter((id) => id !== productId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete product.");
    }
  }

  async function bulkUpdateStatus(status: AdminStatus) {
    try {
      const { products: updatedProducts } = await requestAdminJson<{ products: AdminProduct[] }>("/api/admin/products/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids: selectedIds, status })
      });
      const productById = new Map(updatedProducts.map((product) => [product.id, product]));

      setProducts((current) => current.map((product) => productById.get(product.id) ?? product));
      setSelectedIds([]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update products.");
    }
  }

  async function bulkDelete() {
    try {
      await requestAdminJson<{ ok: boolean }>("/api/admin/products/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds })
      });
      setProducts((current) => current.filter((product) => !selectedIds.includes(product.id)));
      setSelectedIds([]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete products.");
    }
  }

  async function duplicateProduct(product: AdminProduct) {
    try {
      const { product: copy } = await requestAdminJson<{ product: AdminProduct }>(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "POST" });
      setProducts((current) => [copy, ...current]);
      setPage(1);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to duplicate product.");
    }
  }

  function toggleSelected(productId: string) {
    setSelectedIds((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  }

  function toggleVisibleSelected() {
    setSelectedIds((current) => {
      const visibleIds = pageProducts.map((product) => product.id);
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Products"
        description="Version 2 catalog operations with live product data, image previews, bulk workflow controls, and Supabase-backed form actions."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Product
          </button>
        }
      />

      <div className="grid gap-6 2xl:grid-cols-[1fr_480px]">
        <div className="min-w-0 border border-line bg-white">
          <div className="grid gap-4 border-b border-line p-5 xl:grid-cols-[1fr_180px_180px_180px_180px]">
            <label className="relative">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={16} />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPagingAndSelection();
                }}
                placeholder="Search product, SKU, barcode, brand"
                className={`${inputClass} pl-9`}
              />
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                resetPagingAndSelection();
              }}
              className={inputClass}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "all" | AdminStatus);
                resetPagingAndSelection();
              }}
              className={inputClass}
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <select
              value={flagFilter}
              onChange={(event) => {
                setFlagFilter(event.target.value);
                resetPagingAndSelection();
              }}
              className={inputClass}
              aria-label="Filter by product flag"
            >
              <option value="all">All flags</option>
              <option value="featured">Featured</option>
              <option value="bestSeller">Best seller</option>
              <option value="newArrival">New arrival</option>
              <option value="onSale">On sale</option>
              <option value="lowStock">Low stock</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={inputClass}
              aria-label="Sort products"
            >
              <option value="updated-desc">Recently updated</option>
              <option value="name-asc">Name A-Z</option>
              <option value="price-asc">Price low-high</option>
              <option value="price-desc">Price high-low</option>
              <option value="stock-asc">Stock low-high</option>
              <option value="stock-desc">Stock high-low</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-stone">
              <SlidersHorizontal size={16} strokeWidth={1.7} />
              {filteredProducts.length} products - {selectedIds.length} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <BulkButton label="Bulk Publish" disabled={selectedIds.length === 0} onClick={() => bulkUpdateStatus("Published")} />
              <BulkButton label="Bulk Draft" disabled={selectedIds.length === 0} onClick={() => bulkUpdateStatus("Draft")} />
              <BulkButton label="Bulk Delete" disabled={selectedIds.length === 0} onClick={bulkDelete} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleVisibleSelected}
                      className="h-4 w-4 accent-ink"
                      aria-label="Select visible products"
                    />
                  </th>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">SKU / Barcode</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((product) => (
                  <tr key={product.id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelected(product.id)}
                        className="h-4 w-4 accent-ink"
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-mist">
                          <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{product.name}</p>
                          <p className="mt-1 text-xs text-stone">{product.brand}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-stone">
                            {product.featured ? <span>Featured</span> : null}
                            {product.bestSeller ? <span>Best</span> : null}
                            {product.newArrival ? <span>New</span> : null}
                            {product.onSale ? <span>Sale</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone">
                      <p>{product.sku}</p>
                      <p className="mt-1 text-xs">{product.barcode}</p>
                    </td>
                    <td className="px-5 py-4 text-stone">{categoryNameById.get(product.categoryId)}</td>
                    <td className="px-5 py-4">
                      <p className="text-ink">{formatMmk(product.priceMmk)}</p>
                      <p className="mt-1 text-xs text-stone">Cost {formatMmk(product.costPriceMmk)}</p>
                      {product.salePriceMmk ? <p className="mt-1 text-xs text-stone">Sale {formatMmk(product.salePriceMmk)}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <p className={product.stockQuantity <= product.lowStockWarning ? "font-medium text-ink" : "text-stone"}>{product.stockQuantity}</p>
                      <p className="mt-1 text-xs text-stone">Warn {product.lowStockWarning}</p>
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton label={`Duplicate ${product.name}`} onClick={() => duplicateProduct(product)} icon={<Copy size={16} strokeWidth={1.7} />} />
                        <IconButton label={`Edit ${product.name}`} onClick={() => openEditForm(product)} icon={<Pencil size={16} strokeWidth={1.7} />} />
                        <IconButton label={`Delete ${product.name}`} onClick={() => deleteProduct(product.id)} icon={<Trash2 size={16} strokeWidth={1.7} />} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line p-5 text-sm text-stone">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex h-10 items-center gap-2 border border-line px-4 text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} strokeWidth={1.7} />
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="inline-flex h-10 items-center gap-2 border border-line px-4 text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <ProductForm
          categories={categories}
          form={form}
          imageUrlInput={imageUrlInput}
          isOpen={isFormOpen}
          setForm={setForm}
          setImageUrlInput={setImageUrlInput}
          onCancel={() => setIsFormOpen(false)}
          onSave={saveProduct}
        />
      </div>
    </section>
  );
}

type ProductFormProps = {
  categories: AdminCategory[];
  form: ProductFormState;
  imageUrlInput: string;
  isOpen: boolean;
  setForm: (updater: ProductFormState | ((current: ProductFormState) => ProductFormState)) => void;
  setImageUrlInput: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

function ProductForm({ categories, form, imageUrlInput, isOpen, setForm, setImageUrlInput, onCancel, onSave }: ProductFormProps) {
  function addImageUrls(urls: string[]) {
    setForm((current) => ({ ...current, images: Array.from(new Set([...current.images, ...urls.filter(Boolean)])) }));
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    addImageUrls(Array.from(files).map((file) => URL.createObjectURL(file)));
  }

  function addManualImage() {
    addImageUrls([imageUrlInput.trim()]);
    setImageUrlInput("");
  }

  function removeImage(image: string) {
    setForm((current) => ({ ...current, images: current.images.filter((item) => item !== image) }));
  }

  function toggleSize(size: string) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size) ? current.sizes.filter((item) => item !== size) : [...current.sizes, size]
    }));
  }

  return (
    <aside className={cn("border border-line bg-white p-5", !isOpen && "hidden 2xl:block")}>
      <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Product form v2</p>
          <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit product" : "Create product"}</h2>
        </div>
        {isOpen ? (
          <button type="button" onClick={onCancel} className="text-sm text-stone underline underline-offset-8">
            Close
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="mt-5 space-y-5">
          <div
            onDrop={(event) => {
              event.preventDefault();
              handleFiles(event.dataTransfer.files);
            }}
            onDragOver={(event) => event.preventDefault()}
            className="border border-dashed border-line bg-mist p-5"
          >
            <Upload className="text-ink" size={22} strokeWidth={1.6} />
            <p className="mt-3 text-sm font-medium text-ink">Drag and drop product images</p>
            <p className="mt-2 text-xs leading-5 text-stone">Mock local previews now. Later, send these files to Supabase Storage and persist returned URLs.</p>
            <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center border border-ink px-4 text-sm text-ink transition-colors hover:bg-white">
              Choose Files
              <input type="file" multiple accept="image/*" onChange={(event) => handleFiles(event.target.files)} className="sr-only" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {form.images.map((image) => (
              <div key={image} className="group relative aspect-[4/5] overflow-hidden bg-mist">
                <Image src={image} alt="Product preview" fill sizes="130px" unoptimized={image.startsWith("blob:")} className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink opacity-95 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={14} strokeWidth={1.8} />
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={imageUrlInput}
              onChange={(event) => setImageUrlInput(event.target.value)}
              placeholder="/images/new-product.png"
              className={inputClass}
            />
            <button type="button" onClick={addManualImage} className="h-12 border border-line px-4 text-sm text-ink transition-colors hover:border-ink">
              Add URL
            </button>
          </div>

          <Field label="Product Name">
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU">
              <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Barcode">
              <input value={form.barcode} onChange={(event) => setForm((current) => ({ ...current, barcode: event.target.value }))} placeholder="Placeholder barcode" className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className={inputClass}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (MMK)">
              <input type="number" value={form.priceMmk} onChange={(event) => setForm((current) => ({ ...current, priceMmk: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Sale Price">
              <input type="number" value={form.salePriceMmk} onChange={(event) => setForm((current) => ({ ...current, salePriceMmk: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Cost Price">
              <input type="number" value={form.costPriceMmk} onChange={(event) => setForm((current) => ({ ...current, costPriceMmk: event.target.value }))} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stock Quantity">
              <input type="number" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Low Stock Warning">
              <input type="number" value={form.lowStockWarning} onChange={(event) => setForm((current) => ({ ...current, lowStockWarning: event.target.value }))} className={inputClass} />
            </Field>
          </div>
          <Field label="Product Description">
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={cn(inputClass, "min-h-28 resize-y")}
            />
          </Field>
          <Field label="Available Colors">
            <input value={form.colors} onChange={(event) => setForm((current) => ({ ...current, colors: event.target.value }))} className={inputClass} />
          </Field>
          <div>
            <p className={labelClass}>Available Sizes</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {sizeOptions.map((size) => (
                <label key={size} className="flex cursor-pointer items-center justify-between gap-3 border border-line px-3 py-3 text-sm text-ink">
                  {size}
                  <input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} className="h-4 w-4 accent-ink" />
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 border border-line p-4">
            <Toggle label="Featured Product" checked={form.featured} onChange={(checked) => setForm((current) => ({ ...current, featured: checked }))} />
            <Toggle label="Best Seller" checked={form.bestSeller} onChange={(checked) => setForm((current) => ({ ...current, bestSeller: checked }))} />
            <Toggle label="New Arrival" checked={form.newArrival} onChange={(checked) => setForm((current) => ({ ...current, newArrival: checked }))} />
            <Toggle label="On Sale" checked={form.onSale} onChange={(checked) => setForm((current) => ({ ...current, onSale: checked }))} />
          </div>
          <Field label="Draft / Published">
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))} className={inputClass}>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </Field>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Save size={17} strokeWidth={1.7} />
            Save Product
          </button>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-stone">Select a product or create a new one to open the Version 2 editor.</p>
      )}
    </aside>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-ink">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-ink" />
    </label>
  );
}

function BulkButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-10 border border-line px-4 text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function IconButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
