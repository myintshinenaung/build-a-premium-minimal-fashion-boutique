"use client";

import { useMemo, useState } from "react";
import { requestAdminJson } from "@/features/identity/client";
import type { PlatformCategory, Store, StoreStatus } from "@/types/store";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition-colors focus:border-ink";

type StoreManagerProps = {
  initialStores: Store[];
  platformCategories: PlatformCategory[];
};

type StoreFormState = {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  description: string;
  monogram: string;
  status: StoreStatus;
  sortOrder: string;
  platformCategoryIds: string[];
};

function emptyForm(): StoreFormState {
  return {
    name: "",
    slug: "",
    logo: "",
    coverImage: "",
    description: "",
    monogram: "",
    status: "inactive",
    sortOrder: "0",
    platformCategoryIds: []
  };
}

function storeToForm(store: Store): StoreFormState {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    coverImage: store.coverImage,
    description: store.description,
    monogram: store.monogram,
    status: store.status,
    sortOrder: String(store.sortOrder),
    platformCategoryIds: store.platformCategoryIds
  };
}

export function StoreManager({ initialStores, platformCategories }: StoreManagerProps) {
  const [stores, setStores] = useState(initialStores);
  const [form, setForm] = useState<StoreFormState>(emptyForm);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sortedStores = useMemo(
    () => [...stores].sort((left, right) => left.sortOrder - right.sortOrder),
    [stores]
  );

  function openCreate() {
    setForm(emptyForm());
    setIsOpen(true);
    setError("");
    setMessage("");
  }

  function openEdit(store: Store) {
    setForm(storeToForm(store));
    setIsOpen(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name,
      slug: form.slug,
      logo: form.logo,
      coverImage: form.coverImage,
      description: form.description,
      monogram: form.monogram,
      status: form.status,
      sortOrder: Number(form.sortOrder) || 0,
      platformCategoryIds: form.platformCategoryIds
    };

    try {
      const { store } = await requestAdminJson<{ store: Store }>(
        form.id ? `/api/admin/stores/${encodeURIComponent(form.id)}` : "/api/admin/stores",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setStores((current) => {
        const without = current.filter((entry) => entry.id !== store.id);
        return [...without, store];
      });
      setMessage(form.id ? "Store updated." : "Store created.");
      setIsOpen(false);
      setForm(emptyForm());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save store.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStatus(store: Store) {
    setPendingId(store.id);
    setError("");
    setMessage("");

    try {
      const nextStatus: StoreStatus = store.status === "active" ? "inactive" : "active";
      const { store: updated } = await requestAdminJson<{ store: Store }>(
        `/api/admin/stores/${encodeURIComponent(store.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus })
        }
      );

      setStores((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setMessage(`Store marked ${updated.status}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update store status.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone">{sortedStores.length} stores</p>
        <button type="button" onClick={openCreate} className="inline-flex h-11 items-center bg-ink px-4 text-sm font-medium text-white">
          Create store
        </button>
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
            <tr>
              <th className="px-5 py-4 font-medium">Store</th>
              <th className="px-5 py-4 font-medium">Slug</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Platform</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStores.map((store) => (
              <tr key={store.id} className="border-t border-line">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{store.name}</p>
                  <p className="mt-1 text-xs text-stone">{store.description || "—"}</p>
                </td>
                <td className="px-5 py-4 text-stone">{store.slug}</td>
                <td className="px-5 py-4 capitalize text-stone">{store.status}</td>
                <td className="px-5 py-4 text-stone">
                  {store.platformCategoryIds
                    .map((id) => platformCategories.find((category) => category.id === id)?.name ?? id)
                    .join(", ") || "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEdit(store)} className="border border-line px-3 py-2 text-xs font-medium text-ink">
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === store.id}
                      onClick={() => void toggleStatus(store)}
                      className="border border-line px-3 py-2 text-xs font-medium text-ink disabled:opacity-60"
                    >
                      {store.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen ? (
        <form className="space-y-4 border border-line bg-white p-5" onSubmit={handleSubmit}>
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">
            {form.id ? "Edit store" : "Create store"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Name</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Slug</span>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Monogram</span>
              <input
                className={inputClass}
                value={form.monogram}
                onChange={(event) => setForm((current) => ({ ...current, monogram: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Status</span>
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as StoreStatus }))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Description</span>
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Logo URL</span>
              <input
                className={inputClass}
                value={form.logo}
                onChange={(event) => setForm((current) => ({ ...current, logo: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Cover image URL</span>
              <input
                className={inputClass}
                value={form.coverImage}
                onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-stone">Sort order</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-xs uppercase tracking-[0.16em] text-stone">Platform categories</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {platformCategories.map((category) => {
                const checked = form.platformCategoryIds.includes(category.id);
                return (
                  <label key={category.id} className="inline-flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          platformCategoryIds: event.target.checked
                            ? [...current.platformCategoryIds, category.id]
                            : current.platformCategoryIds.filter((id) => id !== category.id)
                        }))
                      }
                    />
                    {category.name}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex gap-2">
            <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center bg-ink px-4 text-sm font-medium text-white disabled:opacity-60">
              {isSaving ? "Saving…" : "Save store"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setForm(emptyForm());
              }}
              className="inline-flex h-11 items-center border border-line px-4 text-sm font-medium text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="border border-line bg-mist px-4 py-3 text-sm text-ink">{error}</p> : null}
      {message ? <p className="border border-line bg-mist px-4 py-3 text-sm text-ink">{message}</p> : null}
    </section>
  );
}
