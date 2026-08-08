"use client";

import { useMemo, useState } from "react";
import type { CustomerAddress } from "@/types/account";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-novora-border bg-white px-4 text-sm text-novora-ink outline-none transition-colors placeholder:text-novora-muted focus:border-novora-ink";

type AddressFormState = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  township: string;
  isDefault: boolean;
};

const emptyForm: AddressFormState = {
  label: "",
  recipientName: "",
  phone: "",
  addressLine: "",
  township: "",
  isDefault: false
};

type AddressManagerProps = {
  initialAddresses: CustomerAddress[];
};

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedAddresses = useMemo(
    () => [...addresses].sort((left, right) => Number(right.isDefault) - Number(left.isDefault)),
    [addresses]
  );

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setIsOpen(true);
    setError("");
    setMessage("");
  }

  function openEdit(address: CustomerAddress) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine: address.addressLine,
      township: address.township,
      isDefault: address.isDefault
    });
    setIsOpen(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = (await response.json()) as { message?: string; address?: CustomerAddress };

      if (!response.ok || !payload.address) {
        setError(payload.message ?? "Unable to save address.");
        return;
      }

      setAddresses((current) => {
        const withoutCurrent = editingId ? current.filter((entry) => entry.id !== editingId) : current;
        const next = [...withoutCurrent.filter((entry) => entry.id !== payload.address!.id), payload.address!];
        return payload.address!.isDefault
          ? next.map((entry) => ({ ...entry, isDefault: entry.id === payload.address!.id }))
          : next;
      });
      setMessage(editingId ? "Address updated." : "Address added.");
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch {
      setError("Unable to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    setPendingId(addressId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Unable to delete address.");
        return;
      }

      setAddresses((current) => current.filter((entry) => entry.id !== addressId));
      setMessage("Address deleted.");
    } catch {
      setError("Unable to delete address. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleSetDefault(address: CustomerAddress) {
    if (address.isDefault) {
      return;
    }

    setPendingId(address.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          addressLine: address.addressLine,
          township: address.township,
          isDefault: true
        })
      });
      const payload = (await response.json()) as { message?: string; address?: CustomerAddress };

      if (!response.ok || !payload.address) {
        setError(payload.message ?? "Unable to update default address.");
        return;
      }

      setAddresses((current) =>
        current.map((entry) => ({
          ...entry,
          isDefault: entry.id === payload.address!.id
        }))
      );
      setMessage("Default address updated.");
    } catch {
      setError("Unable to update default address. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-novora-muted">{sortedAddresses.length} saved</p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-novora-ink px-4 text-sm font-medium text-white"
        >
          Add address
        </button>
      </div>

      {sortedAddresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-novora-border bg-novora-surface/50 px-5 py-8 text-center">
          <p className="text-sm text-novora-muted">No addresses yet. Add your first Address for Myanmar delivery.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedAddresses.map((address) => (
            <li key={address.id} className="rounded-3xl border border-novora-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-novora-ink">
                    {address.label || address.recipientName}
                    {address.isDefault ? (
                      <span className="ml-2 rounded-full bg-novora-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-novora-muted">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-novora-muted">{address.recipientName}</p>
                  <p className="mt-1 text-sm text-novora-muted">{address.phone}</p>
                  <p className="mt-3 text-sm leading-6 text-novora-ink">{address.addressLine}</p>
                  <p className="mt-1 text-sm text-novora-muted">{address.township}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="inline-flex h-10 items-center rounded-2xl border border-novora-border px-3 text-sm font-medium text-novora-ink"
                >
                  Edit
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    disabled={pendingId === address.id}
                    onClick={() => void handleSetDefault(address)}
                    className="inline-flex h-10 items-center rounded-2xl border border-novora-border px-3 text-sm font-medium text-novora-ink disabled:opacity-60"
                  >
                    Set default
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pendingId === address.id}
                  onClick={() => void handleDelete(address.id)}
                  className="inline-flex h-10 items-center rounded-2xl border border-novora-border px-3 text-sm font-medium text-novora-muted disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen ? (
        <form className="space-y-4 rounded-3xl border border-novora-border bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
          <h2 className="text-base font-semibold text-novora-ink">{editingId ? "Edit address" : "Add address"}</h2>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Label</span>
            <input
              className={inputClass}
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder="Home, Office…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Recipient name</span>
            <input
              className={inputClass}
              value={form.recipientName}
              onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Phone</span>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Address</span>
            <textarea
              className={`${inputClass} min-h-24 py-3`}
              value={form.addressLine}
              onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Township</span>
            <input
              className={inputClass}
              value={form.township}
              onChange={(event) => setForm((current) => ({ ...current, township: event.target.value }))}
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-novora-ink">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
              className="h-4 w-4 accent-novora-ink"
            />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-novora-ink text-sm font-medium text-white disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setEditingId(null);
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-novora-border px-4 text-sm font-medium text-novora-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{error}</p> : null}
      {message ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{message}</p> : null}
    </div>
  );
}
