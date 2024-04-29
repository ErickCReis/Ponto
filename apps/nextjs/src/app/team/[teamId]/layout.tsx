import Link from "next/link";

import { api } from "~/trpc/server";
import { ViewTabs } from "./_components/view-tabs";

export const revalidate = 0;

export default async function Layout({
  params,
  tabs,
  admin,
}: {
  params: { teamId: string };
  tabs: React.ReactNode;
  admin: React.ReactNode;
}) {
  const team = await api.team.get(params.teamId);

  if (!team) {
    return <div>Time não encontrado</div>;
  }

  return (
    <main className="h-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link href={`/team/${team.id}`}>
          <h1 className="border-b border-primary text-xl font-semibold">
            {team.name}
          </h1>
        </Link>

        {team.role === "ADMIN" ? (
          admin
        ) : (
          <>
            <ViewTabs teamId={team.id} />
            {tabs}
          </>
        )}
      </div>
    </main>
  );
}
