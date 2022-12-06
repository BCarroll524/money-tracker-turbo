import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useFetcher,
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/utils/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";
import { Header } from "~/components/header";
import type { TrakrHandle } from "types";
import clsx from "clsx";

export const handle: TrakrHandle & { id: string } = {
  id: "login",
  backgroundColor: "bg-black-300",
};

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/home");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/home");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export default function LoginPage() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full justify-evenly">
      <Header />
      <div className="hidden flex-1 bg-gradient-to-tr from-black-300 via-black-200  to-purple sm:block" />
      <div className="mx-auto flex w-full flex-1 flex-col px-5 pt-20 sm:items-center sm:justify-center sm:px-8 sm:pt-0">
        <fetcher.Form method="post" className="w-full space-y-5 sm:max-w-sm">
          <h1 className="text-left text-4xl text-white sm:text-5xl">
            Welcome back
          </h1>
          <p className="!mt-2 text-base text-gray-100">
            Welcome back. Please enter you details.
          </p>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-100"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded-lg bg-black-100 px-3 py-[10px] text-white placeholder:text-gray-200"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-100"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded-lg bg-black-100 px-3 py-[10px] text-white  placeholder:text-gray-200"
              />
              {actionData?.errors?.password && (
                <div className="text-red-700 pt-1" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded-lg"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-white">
              Remember me
            </label>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className={clsx(
              "w-full rounded-lg bg-purple py-3 px-4 text-white",
              fetcher.state === "submitting"
                ? "cursor-not-allowed opacity-50"
                : ""
            )}
          >
            {fetcher.state === "submitting" ? "Signing in..." : "Sign in"}
          </button>

          <div className="pt-4 text-center text-sm text-gray-100">
            Don't have an account?{" "}
            <Link
              className="text-gray-100 underline"
              to={{
                pathname: "/join",
                search: searchParams.toString(),
              }}
            >
              Sign up
            </Link>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
