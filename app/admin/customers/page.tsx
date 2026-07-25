import type { Metadata } from "next";
import { AdminCustomersPage } from "@/features/orders/server";

export const metadata: Metadata = {
  title: "Customers"
};

export const dynamic = "force-dynamic";

export default AdminCustomersPage;
