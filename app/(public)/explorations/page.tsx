import { ExplorationGallery } from "@/components/explorations/ExplorationGallery";
import { Section } from "@/components/public/Section";
import { placeholderExplorations } from "@/lib/content/placeholder-pages";

export default function ExplorationsPage() {
  return (
    <Section eyebrow="Explorations">
      <div className="grid-editorial">
        <h1 className="type-heading desktop:col-span-8 col-span-12">Studies and experiments.</h1>
      </div>

      <div className="mt-16">
        <ExplorationGallery explorations={placeholderExplorations} />
      </div>
    </Section>
  );
}
