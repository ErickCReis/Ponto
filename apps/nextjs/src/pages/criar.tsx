import type { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import { Button } from "~/components/button";
import { api } from "~/utils/api";
import { MyForm } from "~/utils/form";

const CriarSchema = z.object({
  name: z.string(),
});

const Criar: NextPage = () => {
  const router = useRouter();
  const { mutate, isLoading } = api.team.create.useMutation({
    onSuccess: async () => {
      await router.push("/");
    },
  });

  const onSubmit = (values: z.infer<typeof CriarSchema>) => {
    if (isLoading) return;

    mutate(values);
  };

  return (
    <>
      <div className="h-6"></div>
      <h2 className="text-center text-2xl font-bold">Crie seu time</h2>
      <div className="h-6"></div>

      <MyForm
        schema={CriarSchema}
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

export default Criar;
