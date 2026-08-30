import { PagesScreen } from "@/components/admin";
import { getAdminPages } from "@/lib/data/pages";

export default async function AdminPagesPage() {
  const pages = await getAdminPages();

  return <PagesScreen initialPages={pages} />;
}
