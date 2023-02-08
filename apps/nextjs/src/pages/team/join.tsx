import type { InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";
import { createSSR } from "~/utils/ssr";
import { Button } from "~/components/button";

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.string().cuid().optional(),
  }),
  async (_, { teamId }) => {
    if (!teamId) return;

    return {
      result: "success",
      data: {
        teamId,
      },
    };
  },
);

const JoinTeamSchema = z.object({
  teamId: z.string().describe("ID do time // ID do time"),
  dailyWorkload: z
    .number()
    .describe("Carga horária (horas) // Carga horária diária"),
  initialBalanceInMinutes: z
    .number()
    .describe("Saldo inicial (minutos) // Saldo inicial em minutos"),
});

const JoinTeam: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId }) => {
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
          teamId,
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
