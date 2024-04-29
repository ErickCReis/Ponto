"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

export default function Error() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2">
      <h2 className="text-lg">Algo deu errado</h2>
      <Button
        onClick={() => {
          router.push("/");
        }}
      >
        Voltar para a página inicial
      </Button>
    </div>
  );
}
