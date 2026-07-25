import type { Metadata } from "next";
import { AdminOrdersPage } from "@/features/orders/server";

export const metadata: Metadata = {
  title: "Orders"
};

export const dynamic = "force-dynamic";

export default AdminOrdersPage;
