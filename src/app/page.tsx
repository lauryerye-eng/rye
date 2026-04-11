import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function Home() {
  const userId = await requireAuth();
  return <AppShell userId={userId} />;
}
