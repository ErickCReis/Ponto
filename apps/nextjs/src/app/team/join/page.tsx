"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { CreateTeamMemberSchema } from "@acme/validators";

import { api } from "~/trpc/react";

export default function Page({
  searchParams: { teamId },
}: {
  searchParams: { teamId?: string };
}) {
  const router = useRouter();

  const form = useForm({
    schema: CreateTeamMemberSchema,
    defaultValues: {
      teamId: teamId ?? "",
      dailyWorkload: 8,
      initialBalanceInMinutes: 0,
    },
  });

  const createTeamMember = api.teamMember.create.useMutation({
    onSuccess: (team) => {
      router.push(`/team/${team.id}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <main className="h-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="border-b border-primary text-xl font-semibold">
          Juntar-se a um time
        </h1>

        <Form {...form}>
          <form
            className="flex w-full max-w-2xl flex-col gap-6"
            onSubmit={form.handleSubmit((data) => {
              createTeamMember.mutate(data);
            })}
          >
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ID do time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyWorkload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga horária (horas)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite a carga horária ..."
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initialBalanceInMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo inicial (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite o saldo inicial ..."
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={createTeamMember.isPending}>
              {createTeamMember.isPending ? "Entrando" : "Entrar"}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
