import { z } from "zod";
import { MyForm } from "~/utils/form";

const SignUpSchema = z.object({
  timezone: z.string(),
  cargaHoraria: z.number(),
});

const Perfil = () => {
  const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
    console.log(data);
  };

  return (
    <MyForm
      schema={SignUpSchema}
      onSubmit={onSubmit}
      renderAfter={() => <button type="submit">Salvar</button>}
      props={{
        timezone: {
          className: "my-2",
        },
        cargaHoraria: {
          className: "my-2",
        },
      }}
    />
  );
};

export default Perfil;
