import type { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import { Button } from "~/components/button";
import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";

const JoinTeamSchema = z.object({
  id: z.string(),
});

const JoinTeam: NextPage = () => {
  const router = useRouter();
  const { mutate, isLoading } = api.team.join.useMutation({
    onSuccess: async (team) => {
      await router.push(`/${team.id}`);
    },
  });

  const onSubmit = (values: z.infer<typeof JoinTeamSchema>) => {
    if (isLoading) return;

    mutate(values.id);
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
        props={{
          id: {
            className: "my-2",
          },
        }}
      />
    </>
  );
};

export default JoinTeam;
