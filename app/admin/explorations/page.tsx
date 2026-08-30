import { ExplorationsCollectionScreen } from "@/components/admin/CollectionScreens";
import {
  createExploration,
  deleteExploration,
  reorderExplorations,
  syncExplorationMedia,
  updateExploration,
} from "@/lib/actions/explorations";
import { createMediaAsset } from "@/lib/actions/media";
import { getAdminExplorationMedia, getAdminExplorations } from "@/lib/data/explorations";
import { getAdminMediaPickerAssets } from "@/lib/data/media";

export default async function AdminExplorationsPage() {
  const [explorations, media, mediaAssets] = await Promise.all([
    getAdminExplorations(),
    getAdminExplorationMedia(),
    getAdminMediaPickerAssets(),
  ]);

  return (
    <ExplorationsCollectionScreen
      initialItems={explorations}
      initialMedia={media}
      mediaAssets={mediaAssets}
      uploadAction={createMediaAsset}
      createAction={createExploration}
      updateAction={updateExploration}
      deleteAction={deleteExploration}
      reorderAction={reorderExplorations}
      syncMediaAction={syncExplorationMedia}
    />
  );
}
