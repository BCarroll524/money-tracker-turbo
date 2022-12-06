import { Header } from "~/components/header";
import {
  Link,
  useFetcher,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { badRequest, getErrorMessage } from "~/utils";
import type { TrakrHandle } from "types";
import { useState } from "react";
import { FormSelect } from "~/components/form-select";
import { getUsersSources } from "~/models/user.server";
import { requireUser } from "~/utils/session.server";
import { addBalance } from "~/models/balance.server";

export const handle: TrakrHandle & { id: string } = {
  id: "add-balance",
  backgroundColor: "bg-black-300",
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const sources = await getUsersSources(user.id);

  return json({ sources });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUser(request);
  try {
    const form = new URLSearchParams(await request.text());
    const balance = form.get("balance");
    const sourceId = form.get("sourceId");

    if (balance === "" || Number(balance) === 0) {
      return badRequest({ error: "A balance greater than zero is required." });
    }

    if (!sourceId) {
      return badRequest({ error: "A source is required." });
    }

    await addBalance({
      balance: Number(balance) * 100,
      sourceId,
    });

    return redirect("/home?show=balance");
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return json({ error: message }, { status: 400 });
  }
};

export default function AddBalances() {
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [value, setValue] = useState("");

  return (
    <section className="flex min-h-full flex-col px-5 pt-[72px] pb-8">
      <Header />
      <h1 className="pb-3 text-2xl font-medium text-white">Add Balance</h1>

      {actionData?.error ? (
        <p className="pb-2 text-base text-red">{actionData.error}</p>
      ) : null}

      <fetcher.Form
        method="post"
        className="flex min-h-full flex-1 flex-col gap-4"
      >
        <div className="flex items-center justify-center rounded-lg bg-black-100 px-6 py-8">
          <h2 className="text-6xl  tabular-nums text-white">$</h2>
          <div
            contentEditable
            inputMode="decimal"
            className="bg-transparent text-center text-6xl text-white outline-none empty:before:content-[attr(placeholder)]
            "
            placeholder="0.00"
            onInput={(e) => {
              setValue(e.currentTarget.innerText);
            }}
          />
        </div>

        <input type="hidden" name="balance" value={value} />

        <FormSelect
          options={data.sources.map((source) => ({
            value: source.id,
            label: source.name,
          }))}
          label="Account"
          name="sourceId"
        />

        <div className="mt-auto mb-6 flex flex-col gap-3">
          <button className="flex w-full flex-1 items-center justify-between rounded-lg bg-purple py-3 px-3 text-white">
            <span className="text-base font-semibold uppercase">
              Add balance
            </span>
            <CheckIcon className="h-5 w-5 stroke-white" />
          </button>
          <Link
            to="/home"
            className="flex w-full flex-1 items-center justify-between rounded-lg bg-black-100 py-3 px-3 text-white"
          >
            <span className="text-base font-semibold uppercase">cancel</span>
            <XMarkIcon className="h-5 w-5 stroke-white" />
          </Link>
        </div>
      </fetcher.Form>
    </section>
  );
}

/**
 * want text to fill out from right to left
 * 0.00 -> 0.01 -> 0.10 -> 1.00 -> 10.00 -> 100.00 -> 1000.00
 *
 */
