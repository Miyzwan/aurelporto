import { ProcessCollectionScreen } from "@/components/admin/CollectionScreens";
import { createMediaAsset } from "@/lib/actions/media";
import {
  createProcessStep,
  deleteProcessStep,
  reorderProcessSteps,
  updateProcessStep,
} from "@/lib/actions/process";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { getAdminProcessSteps } from "@/lib/data/process";

export default async function AdminProcessPage() {
  const [steps, mediaAssets] = await Promise.all([
    getAdminProcessSteps(),
    getAdminMediaPickerAssets(),
  ]);
  return (
    <ProcessCollectionScreen
      initialItems={steps}
      mediaAssets={mediaAssets}
      uploadAction={createMediaAsset}
      createAction={createProcessStep}
      updateAction={updateProcessStep}
      deleteAction={deleteProcessStep}
      reorderAction={reorderProcessSteps}
    />
  );
}
