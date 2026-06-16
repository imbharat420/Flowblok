import { redirect } from "next/navigation";

// The visual editor is now a full-page surface outside the app shell.
export default async function LegacyBuilderRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/editor/${id}`);
}
