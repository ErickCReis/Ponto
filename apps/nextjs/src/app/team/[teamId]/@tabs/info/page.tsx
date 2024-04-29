import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { UserInfo } from "../../_components/user-info";

export default async function Page({
  params: { teamId },
}: {
  params: { teamId: string };
}) {
  const teamMember = await api.teamMember.get({ teamId });

  if (!teamMember) {
    redirect(`/team/${teamId}`);
  }

  const history = await api.timeRecord.history({ teamId });

  return <UserInfo teamMember={teamMember} history={history} />;
}
