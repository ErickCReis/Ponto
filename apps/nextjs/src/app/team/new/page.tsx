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
import { CreateTeamSchema } from "@acme/validators";

import { api } from "~/trpc/react";

export default function Page() {
  const router = useRouter();

  const form = useForm({
    schema: CreateTeamSchema,
    defaultValues: {
      name: "",
    },
  });

  const createTeam = api.team.create.useMutation({
    onSuccess: async (team) => {
      await router.push(`/team/${team.id}`);
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to post"
          : "Failed to create post",
      );
    },
  });

  return (
    <main className="h-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="border-b border-primary text-xl font-semibold">
          Crie seu time
        </h1>

        <Form {...form}>
          <form
            className="flex w-full max-w-2xl flex-col gap-6"
            onSubmit={form.handleSubmit((data) => {
              createTeam.mutate(data);
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={createTeam.isPending}>
              {createTeam.isPending ? "Criando" : "Criar"}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
