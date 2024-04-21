import type { InferGetServerSidePropsType, NextPage } from "next";
import { z } from "zod";

import { Button } from "~/old/components/button";
import { api } from "~/old/utils/api";
import { MyForm } from "~/old/utils/form";
import { createSSR } from "~/old/utils/ssr";

const InfoTeamSchema = z.object({
  dailyWorkload: z
    .number()
    .describe("Carga horária (horas) // Digite a carga horária"),
  initialBalanceInMinutes: z
    .number()
    .describe("Saldo inicial (minutos) // Saldo inicial em minutos"),
});

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().uuid(),
  }),
  async (ssr, { teamId }) => {
    await ssr.teamMember.get.prefetch({ teamId });
    await ssr.timeRecord.history.prefetch({ teamId });
  },
);

const InfoTeam: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId }) => {
  const utils = api.useContext();
  const { data: teamMember } = api.teamMember.get.useQuery({ teamId });
  const { data: history } = api.timeRecord.history.useQuery({ teamId });
  const { mutate, isLoading } = api.teamMember.update.useMutation({
    onSuccess: async () => {
      await utils.teamMember.get.refetch({ teamId });
      await utils.timeRecord.history.refetch({ teamId });
    },
  });

  const onSubmit = (values: z.infer<typeof InfoTeamSchema>) => {
    if (isLoading) return;

    if (
      teamMember?.dailyWorkload === values.dailyWorkload &&
      teamMember?.initialBalanceInMinutes == values.initialBalanceInMinutes
    )
      return;

    mutate({ ...values, teamId: teamId });
  };

  return (
    <>
      <div className="text-xl font-bold">Histórico</div>
      <div className="h-4"></div>
      <div className="flex min-w-[400px] flex-col text-center">
        <div className="flex font-bold">
          <div className="flex-1">MÊS</div>
          <div className="flex-1">SALDO</div>
          <div className="flex-1">ACUMULADO</div>
        </div>
        {history?.map((month, i) => (
          <div key={i} className="flex">
            <div className="flex-1">{month.label}</div>
            <div className="flex-1">
              {(month.balance / 1000 / 60 / 60).toFixed(1)} horas
            </div>
            <div className="flex-1">
              {(month.accumulatedBalance / 1000 / 60 / 60).toFixed(1)} horas
            </div>
          </div>
        ))}
      </div>
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
