import { notFound } from "next/navigation";

import { InquiryDetailScreen } from "@/components/admin/CollectionScreens";
import { updateInquiry } from "@/lib/actions/inquiries";
import { getAdminInquiryById } from "@/lib/data/inquiries";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getAdminInquiryById(id);
  if (!inquiry) notFound();

  return <InquiryDetailScreen inquiry={inquiry} updateAction={updateInquiry} />;
}
