import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(_) {
    console.log("middleware");
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
