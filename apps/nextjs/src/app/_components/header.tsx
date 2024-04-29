import Link from "next/link";

import { auth, signIn, signOut } from "@acme/auth";
import { Button } from "@acme/ui/button";

export function Header() {
  return (
    <div className="flex items-end justify-between py-4">
      <Link
        href="/"
        className="text-4xl font-extrabold tracking-tight text-primary"
      >
        Ponto
      </Link>

      <Auth />
    </div>
  );
}

async function Auth() {
  const session = await auth();

  if (!session) {
    return (
      <form>
        <Button
          formAction={async () => {
            "use server";
            await signIn("discord");
          }}
        >
          Sign in with Discord
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
