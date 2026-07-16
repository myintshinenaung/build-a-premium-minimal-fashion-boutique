"use client";

import Image from "next/image";
import { Folder, Grid3X3, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import type { AdminMedia } from "@/types/admin";

type ViewMode = "folders" | "grid";

export function MediaLibrary({ media }: { media: AdminMedia[] }) {
  const [query, setQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedMediaId, setSelectedMediaId] = useState(media[0]?.id ?? "");

  const folders = useMemo(() => {
    const grouped = new Map<string, number>();
    media.forEach((item) => grouped.set(item.folder, (grouped.get(item.folder) ?? 0) + 1));
    return ["All", ...Array.from(grouped.keys()).sort()].map((folder) => ({
      name: folder,
      count: folder === "All" ? media.length : grouped.get(folder) ?? 0
    }));
  }, [media]);

  const filteredMedia = media.filter((item) => {
    const search = query.trim().toLowerCase();
    const matchesFolder = activeFolder === "All" || item.folder === activeFolder;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.folder.toLowerCase().includes(search) ||
      item.usedIn.toLowerCase().includes(search);
    return matchesFolder && matchesSearch;
  });

  const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? filteredMedia[0] ?? media[0];

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Media Library"
        description="Version 2 image workspace with folders, search, preview, and a future upload path for Supabase Storage."
        action={
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 border border-ink px-5 text-sm font-medium text-ink transition-colors hover:bg-white"
          >
            <Upload size={17} strokeWidth={1.7} />
            Upload Placeholder
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
        <aside className="border border-line bg-white p-5">
          <div className="border-b border-line pb-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Folders</p>
            <h2 className="mt-2 text-xl font-medium text-ink">Media groups</h2>
          </div>
          <div className="mt-5 space-y-2">
            {folders.map((folder) => (
              <button
                key={folder.name}
                type="button"
                onClick={() => setActiveFolder(folder.name)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm transition-colors",
                  activeFolder === folder.name ? "bg-ink text-white" : "text-stone hover:bg-mist hover:text-ink"
                )}
              >
                <span className="flex items-center gap-2">
                  <Folder size={16} strokeWidth={1.7} />
                  {folder.name}
                </span>
                <span>{folder.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 border border-dashed border-line bg-mist p-5 text-sm text-stone">
            <Upload className="mb-3 text-ink" size={20} strokeWidth={1.6} />
            Future upload architecture: select file, upload to storage, store URL and metadata in media table.
          </div>
        </aside>

        <div className="min-w-0 border border-line bg-white">
          <div className="grid gap-4 border-b border-line p-5 md:grid-cols-[1fr_auto]">
            <label className="relative">
              <span className="sr-only">Search media</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={16} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files, folders, usage"
                className="h-12 w-full border border-line bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
              />
            </label>
            <div className="flex border border-line">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn("inline-flex h-12 items-center gap-2 px-4 text-sm", viewMode === "grid" ? "bg-ink text-white" : "text-ink")}
              >
                <Grid3X3 size={16} strokeWidth={1.7} />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("folders")}
                className={cn("inline-flex h-12 items-center gap-2 px-4 text-sm", viewMode === "folders" ? "bg-ink text-white" : "text-ink")}
              >
                <Folder size={16} strokeWidth={1.7} />
                Folder View
              </button>
            </div>
          </div>

          {viewMode === "folders" ? (
            <div className="divide-y divide-line">
              {folders
                .filter((folder) => folder.name !== "All")
                .map((folder) => (
                  <div key={folder.name} className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-medium text-ink">{folder.name}</h3>
                      <span className="text-sm text-stone">{folder.count} files</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                      {media
                        .filter((item) => item.folder === folder.name)
                        .slice(0, 5)
                        .map((item) => (
                          <MediaTile key={item.id} item={item} selected={selectedMedia?.id === item.id} onSelect={() => setSelectedMediaId(item.id)} compact />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3 2xl:grid-cols-4">
              {filteredMedia.map((item) => (
                <MediaTile key={item.id} item={item} selected={selectedMedia?.id === item.id} onSelect={() => setSelectedMediaId(item.id)} />
              ))}
            </div>
          )}
        </div>

        <aside className="border border-line bg-white p-5">
          {selectedMedia ? (
            <>
              <div className="relative aspect-square overflow-hidden bg-mist">
                <Image src={selectedMedia.url} alt={selectedMedia.name} fill sizes="320px" className="object-cover" />
              </div>
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Image preview</p>
                <h2 className="mt-2 break-words text-xl font-medium text-ink">{selectedMedia.name}</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <Detail label="Folder" value={selectedMedia.folder} />
                  <Detail label="Type" value={selectedMedia.type} />
                  <Detail label="Size" value={selectedMedia.size} />
                  <Detail label="Dimensions" value={selectedMedia.dimensions} />
                  <Detail label="Used in" value={selectedMedia.usedIn} />
                </dl>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone">Select an image to preview.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

function MediaTile({ item, selected, onSelect, compact = false }: { item: AdminMedia; selected: boolean; onSelect: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn("border bg-white text-left transition-colors hover:border-ink", selected ? "border-ink" : "border-line")}
    >
      <div className="relative aspect-square overflow-hidden bg-mist">
        <Image src={item.url} alt={item.name} fill sizes={compact ? "120px" : "(min-width: 1280px) 18vw, 50vw"} className="object-cover" />
      </div>
      {!compact ? (
        <div className="p-4">
          <h2 className="truncate text-sm font-medium text-ink">{item.name}</h2>
          <p className="mt-2 text-xs text-stone">{item.folder}</p>
          <p className="mt-1 truncate text-xs text-stone">{item.usedIn}</p>
        </div>
      ) : null}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
