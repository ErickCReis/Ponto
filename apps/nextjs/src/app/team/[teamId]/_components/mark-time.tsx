"use client";

import { Button } from "@acme/ui/button";

import { useConfirmClick } from "~/hooks/use-confirm-click";
import { api } from "~/trpc/react";

export function MarkTime({ teamId }: { teamId: string }) {
  const utils = api.useUtils();

  const createTimeRecord = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
    },
  });

  const { handleClick, textToShow } = useConfirmClick({
    text: "Marcar ponto",
    onConfirm: () => {
      createTimeRecord.mutate({ teamId });
    },
  });

  return (
    <>
      <Button disabled={createTimeRecord.isPending} onClick={handleClick}>
        {createTimeRecord.isPending ? "Salvando" : textToShow}
      </Button>
    </>
  );
}
