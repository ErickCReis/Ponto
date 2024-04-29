import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { UserInfo } from "../../../_components/user-info";

export default async function Page({
  params: { teamId, userId },
}: {
  params: { teamId: string; userId: string };
}) {
  const teamMember = await api.teamMember.get({ teamId, userId });

  if (!teamMember) {
    redirect(`/team/${teamId}`);
  }

  const history = await api.timeRecord.history({ teamId, userId });

  return <UserInfo teamMember={teamMember} history={history} />;
}
