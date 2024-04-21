import Link from "next/link";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";

export async function Teams() {
  const teams = await api.team.all();

  return (
    <div className="flex flex-col gap-6">
      {teams.length === 0 ? (
        <div className="w-full text-center">
          Você ainda não faz parte de nenhum time
        </div>
      ) : (
        <>
          <h1 className="border-b border-primary text-xl font-semibold">
            Times
          </h1>
          <div className="flex flex-col gap-2">
            {teams.map((team) => (
              <Button
                variant="outline"
                className="w-full gap-2"
                key={team.id}
                asChild
              >
                <Link
                  href={
                    team.role === "ADMIN"
                      ? `/team/${team.id}/admin`
                      : `/team/${team.id}`
                  }
                >
                  <Badge
                    variant={team.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {team.role}
                  </Badge>
                  <span>{team.name}</span>
                  <div className="flex-1"></div>
                  <span>ver time</span>
                </Link>
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Button asChild className="flex-1">
          <Link href="/team/new">Crie um time</Link>
        </Button>

        <div>ou</div>

        <Button asChild className="flex-1">
          <Link href="/team/join">Junte-se a um time</Link>
        </Button>
      </div>
    </div>
  );
}
