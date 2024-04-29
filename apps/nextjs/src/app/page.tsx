import { Suspense } from "react";

import { auth } from "@acme/auth";

import { Teams } from "./_components/teams";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="h-full">
      <div className="flex flex-col items-center justify-center gap-6">
        {session ? (
          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">Loading...</div>
              }
            >
              <Teams />
            </Suspense>
          </div>
        ) : (
          <span className="text-lg">Faça o login para ver seus times</span>
        )}
      </div>
    </main>
  );
}
