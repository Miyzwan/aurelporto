import { MediaCollectionScreen } from "@/components/admin/CollectionScreens";
import { createMediaAsset, hardDeleteMediaAsset, setMediaAssetArchived } from "@/lib/actions/media";
import { getAdminMediaAssets } from "@/lib/data/media";

export default async function AdminMediaPage() {
  const media = await getAdminMediaAssets();
  return (
    <MediaCollectionScreen
      initialItems={media}
      uploadAction={createMediaAsset}
      archiveAction={setMediaAssetArchived}
      hardDeleteAction={hardDeleteMediaAsset}
    />
  );
}
