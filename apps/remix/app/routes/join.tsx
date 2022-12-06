import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/utils/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { Header } from "~/components/header";
import type { TrakrHandle } from "types";

export const handle: TrakrHandle & { id: string } = {
  id: "join",
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

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: "/welcome",
  });
}

export default function Join() {
  const [searchParams] = useSearchParams();
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
        <Form method="post" className="w-full space-y-5 sm:max-w-sm">
          <h1 className="text-left text-4xl text-white sm:text-5xl">
            Money Tracker
          </h1>
          <p className="!mt-2 text-base text-gray-200">
            Join us to track down where you are spending.
          </p>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200"
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
                className="w-full rounded-lg bg-black-100 px-3 py-[10px] text-white  placeholder:text-gray-200 "
              />
              {actionData?.errors?.email && (
                <div className="text-red-500 pt-1" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200"
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
                className="w-full rounded-lg bg-black-100 px-3 py-[10px] text-white placeholder:text-gray-200 "
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-purple  py-3 px-4 text-white hover:opacity-90 focus:bg-gray-200"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-100">
              Already have an account?{" "}
              <Link
                className="text-gray-200 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
