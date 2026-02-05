import { DeveloperHeader } from "./developer-header";

interface PlaceholderPageProps {
  title: string;
}

export function DeveloperPlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <DeveloperHeader title={title} />
      <div className="rounded-xl border bg-white p-12 shadow-sm text-center">
        <h2 className="text-xl font-semibold text-gray-400">
          {title} page coming soon
        </h2>
        <p className="mt-2 text-gray-500">This page is under development</p>
      </div>
    </div>
  );
}
