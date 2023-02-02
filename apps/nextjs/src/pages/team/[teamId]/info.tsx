import type { InferGetServerSidePropsType, NextPage } from "next";
import { z } from "zod";

import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";
import { createSSR } from "~/utils/ssr";
import { Button } from "~/components/button";

const InfoTeamSchema = z.object({
  dailyWorkload: z.number().describe("Carga horária // Digite a carga horária"),
  initialBalanceInMinutes: z
    .number()
    .describe("Saldo inicial (minutos) // Saldo inicial em minutos"),
});

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().cuid(),
  }),
  async (ssr, { teamId }) => {
    await ssr.auth.getSession.prefetch();
    await ssr.teamMember.get.prefetch({ teamId });
  },
);

const InfoTeam: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId }) => {
  const utils = api.useContext();
  const { data: session } = api.auth.getSession.useQuery();
  const { data: teamMember } = api.teamMember.get.useQuery({ teamId: teamId });
  const { mutate, isLoading } = api.teamMember.update.useMutation({
    onSuccess: async () => {
      await utils.teamMember.get.refetch({ teamId: teamId });
    },
  });

  const onSubmit = (values: z.infer<typeof InfoTeamSchema>) => {
    if (isLoading) return;

    if (teamMember?.dailyWorkload === values.dailyWorkload) return;

    mutate({ ...values, teamId: teamId });
  };

  return (
    <>
      <div className="h-6"></div>
      <h2 className="text-center text-2xl font-bold">Olá {session?.name}!</h2>
      <div className="h-6"></div>

      <div className="text-xl font-bold">Configurações</div>
      <div className="h-4"></div>
      <MyForm
        schema={InfoTeamSchema}
        onSubmit={onSubmit}
        renderAfter={() => (
          <div className="mt-3 flex justify-center">
            <Button type="submit">{isLoading ? "Salvando" : "Salvar"}</Button>
          </div>
        )}
        defaultValues={{
          dailyWorkload: teamMember?.dailyWorkload,
          initialBalanceInMinutes: teamMember?.initialBalanceInMinutes,
        }}
        props={{
          dailyWorkload: {
            type: "number",
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

export default InfoTeam;
