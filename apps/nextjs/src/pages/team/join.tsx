import type { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";
import { Button } from "~/components/button";

const JoinTeamSchema = z.object({
  teamId: z.string().describe("ID do time // ID do time"),
  dailyWorkload: z.number().describe("Carga horária // Carga horária diária"),
  initialBalanceInMinutes: z
    .number()
    .describe("Saldo inicial (minutos) // Saldo inicial em minutos"),
});

const JoinTeam: NextPage = () => {
  const router = useRouter();
  const { mutate, isLoading } = api.teamMember.create.useMutation({
    onSuccess: async (team) => {
      await router.push(`/team/${team.id}`);
    },
  });

  const onSubmit = (values: z.infer<typeof JoinTeamSchema>) => {
    if (isLoading) return;

    mutate(values);
  };

  return (
    <>
      <div className="h-6"></div>
      <h2 className="text-center text-2xl font-bold">Juntar-se a um time</h2>
      <div className="h-6"></div>

      <MyForm
        schema={JoinTeamSchema}
        onSubmit={onSubmit}
        renderAfter={() => (
          <div className="mt-3 flex justify-center">
            <Button type="submit">
              {isLoading ? "Carregando" : "Juntar-se"}
            </Button>
          </div>
        )}
        defaultValues={{
          initialBalanceInMinutes: 0,
        }}
        props={{
          dailyWorkload: {
            type: "number",
            beforeElement: <div className="h-2"></div>,
          },
          initialBalanceInMinutes: {
            type: "number",
            beforeElement: <div className="h-2"></div>,
          },
        }}
      />
    </>
  );
};

export default JoinTeam;
