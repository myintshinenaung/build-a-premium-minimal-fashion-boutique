import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { adminMedia } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Media Library"
};

export default function AdminMediaPage() {
  return <MediaLibrary media={adminMedia} />;
}
