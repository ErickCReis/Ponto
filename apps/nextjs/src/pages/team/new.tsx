import type { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";
import { Button } from "~/components/button";

const NewTeamSchema = z.object({
  name: z.string(),
});

const NewTeam: NextPage = () => {
  const router = useRouter();
  const { mutate, isLoading } = api.team.create.useMutation({
    onSuccess: async (team) => {
      await router.push(`/team/${team.id}/admin`);
    },
  });

  const onSubmit = (values: z.infer<typeof NewTeamSchema>) => {
    if (isLoading) return;

    mutate(values);
  };

  return (
    <>
      <div className="h-6"></div>
      <h2 className="text-center text-2xl font-bold">Crie seu time</h2>
      <div className="h-6"></div>

      <MyForm
        schema={NewTeamSchema}
        onSubmit={onSubmit}
        renderAfter={() => (
          <div className="mt-3 flex justify-center">
            <Button type="submit">{isLoading ? "Criando" : "Criar"}</Button>
          </div>
        )}
        props={{
          name: {
            className: "my-2",
          },
        }}
      />
    </>
  );
};

export default NewTeam;
