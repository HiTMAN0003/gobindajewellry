import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const AdminStudio = lazy(() =>
  import("@/components/admin-studio").then((module) => ({ default: module.AdminStudio })),
);

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <main className="grid min-h-svh place-items-center text-ivory-dim">Loading studio…</main>;
  if (!user) return <RedirectToSignIn />;
  return (
    <Suspense fallback={<main className="grid min-h-svh place-items-center text-ivory-dim">Opening studio…</main>}>
      <AdminStudio />
    </Suspense>
  );
}
