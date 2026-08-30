import { InquiriesCollectionScreen } from "@/components/admin/CollectionScreens";
import { getAdminInquiries } from "@/lib/data/inquiries";

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries();
  return <InquiriesCollectionScreen initialItems={inquiries} />;
}
