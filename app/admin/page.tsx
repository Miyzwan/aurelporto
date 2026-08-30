import { DashboardScreen } from "@/components/admin";
import { getAdminInquiries } from "@/lib/data/inquiries";
import { getAdminPages } from "@/lib/data/pages";

export default async function AdminDashboardPage() {
  const [pages, inquiries] = await Promise.all([getAdminPages(), getAdminInquiries()]);

  const newInquiries = inquiries.filter((inq) => inq.status === "new");

  return (
    <DashboardScreen
      stats={{
        pagesCount: pages.length,
        inquiriesNewCount: newInquiries.length,
      }}
    />
  );
}
