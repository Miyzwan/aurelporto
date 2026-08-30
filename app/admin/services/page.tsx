import { ServicesCollectionScreen } from "@/components/admin/CollectionScreens";
import { createMediaAsset } from "@/lib/actions/media";
import {
  createService,
  deleteService,
  reorderServices,
  updateService,
} from "@/lib/actions/services";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { getAdminServices } from "@/lib/data/services";

export default async function AdminServicesPage() {
  const [services, mediaAssets] = await Promise.all([
    getAdminServices(),
    getAdminMediaPickerAssets(),
  ]);
  return (
    <ServicesCollectionScreen
      initialItems={services}
      mediaAssets={mediaAssets}
      uploadAction={createMediaAsset}
      createAction={createService}
      updateAction={updateService}
      deleteAction={deleteService}
      reorderAction={reorderServices}
    />
  );
}
