import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Section } from "@/components/public/Section";
import { placeholderProcessSteps } from "@/lib/content/placeholder-home";

export default function ProcessPage() {
  return (
    <Section eyebrow="Process">
      <div className="grid-editorial">
        <h1 className="type-heading desktop:col-span-8 col-span-12">
          How a space gets from brief to visualization.
        </h1>
      </div>

      <div className="mt-16">
        <ProcessTimeline steps={placeholderProcessSteps} />
      </div>
    </Section>
  );
}
