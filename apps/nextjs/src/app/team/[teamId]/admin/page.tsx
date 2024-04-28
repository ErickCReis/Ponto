import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { CopyText } from "./_components/copy-text";

export default async function Page({ params }: { params: { teamId: string } }) {
  const session = await auth();
  const team = await api.team.get(params.teamId);

  if (!team) {
    redirect("/");
  }

  if (team.role !== "ADMIN") {
    redirect(`/team/${team.id}`);
  }

  const host = headers().get("host") ?? "";
  const teamMembers = await api.teamMember.all(team.id);

  return (
    <>
      <h2 className="text-xl font-semibold">Convide novos membros</h2>

      <CopyText copyText={`${host}/team/join?teamId=${team.id}`} />

      <h2 className="text-xl font-semibold">Membros</h2>

      <div className="flex flex-col gap-2">
        {teamMembers.map((member) => (
          <Button
            variant="outline"
            className="w-full gap-2"
            key={member.id}
            asChild
          >
            <Link href={`/team/${team.id}/admin/${member.id}`}>
              <Badge
                variant={member.role === "ADMIN" ? "default" : "secondary"}
              >
                {member.id === session?.user.id ? "VOCÊ" : member.role}
              </Badge>
              <span>{member.name}</span>
              <div className="flex-1"></div>
              <span>visualizar</span>
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
}
