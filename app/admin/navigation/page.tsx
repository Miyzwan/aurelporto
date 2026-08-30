import { NavigationScreen } from "@/components/admin";
import {
  createNavigationItem,
  deleteNavigationItem,
  reorderNavigationItems,
  updateNavigationItem,
} from "@/lib/actions/navigation";
import { getAdminNavigation } from "@/lib/data/site";

export default async function AdminNavigationPage() {
  const items = await getAdminNavigation();

  return (
    <NavigationScreen
      initialItems={items}
      createAction={createNavigationItem}
      updateAction={updateNavigationItem}
      deleteAction={deleteNavigationItem}
      reorderAction={reorderNavigationItems}
    />
  );
}
