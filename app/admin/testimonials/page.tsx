import { TestimonialsCollectionScreen } from "@/components/admin/CollectionScreens";
import {
  createTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  updateTestimonial,
} from "@/lib/actions/testimonials";
import { getAdminTestimonials } from "@/lib/data/testimonials";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();
  return (
    <TestimonialsCollectionScreen
      initialItems={testimonials}
      createAction={createTestimonial}
      updateAction={updateTestimonial}
      deleteAction={deleteTestimonial}
      reorderAction={reorderTestimonials}
    />
  );
}
