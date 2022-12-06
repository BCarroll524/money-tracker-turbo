import type { TrakrHandle } from "types";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Header } from "~/components/header";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { requireUser } from "~/utils/session.server";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUsersSources } from "~/models/user.server";
import { createTransaction } from "~/models/transaction.server";
import { getErrorMessage } from "~/utils";
import { FormInput } from "~/components/form-input";
import { FormSelect } from "~/components/form-select";
import { FormDatePicker } from "~/components/form-date";
import { format, parse } from "date-fns";
import { FormRadioGroup } from "~/components/form-radio";
import { FormCategories } from "~/components/form-categories";

export const handle: TrakrHandle & { id: string } = {
  id: "new-transaction",
  backgroundColor: "bg-black-300",
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const sources = await getUsersSources(user.id);

  return json({ sources });
};

export const action = async ({ request }: ActionArgs) => {
  const form = new URLSearchParams(await request.text());
  const name = form.get("name");
  const amount = form.get("amount");
  const sourceId = form.get("sourceId");
  const type = form.get("type");
  const category = form.get("category");
  const date = form.get("date") || format(new Date(), "T");
  const transactionDate = parse(date, "T", new Date());

  if (!name || !amount || !sourceId || !type || !category) {
    return json({ error: "Please fill out all form fields" }, { status: 400 });
  }

  const user = await requireUser(request);

  try {
    const transaction = await createTransaction({
      name,
      amount: Number(amount) * 100,
      sourceId,
      type,
      label: category,
      userId: user.id,
      date: transactionDate,
    });

    return redirect("/home?tId=" + transaction.id);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return json({ error: message }, { status: 400 });
  }
};

export default function NewTransaction() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <section className="min-h-full px-5 pt-[72px] pb-8">
      <Header />
      <h1 className="pb-3 text-2xl font-medium text-white">
        New Transaction Details
      </h1>
      {actionData?.error ? (
        <p className="pb-2 text-base text-red">{actionData.error}</p>
      ) : null}
      <Form method="post" className="flex min-h-full flex-col gap-4">
        <FormInput label="Name" name="name" placeholder="Gym membership" />
        <FormDatePicker label="Date" name="date" />
        <FormInput
          label="Amount Spent"
          name="amount"
          placeholder="10.00"
          type="number"
          min={0}
          step=".01"
        />
        <FormSelect
          options={data.sources.map((source) => ({
            value: source.id,
            label: source.name,
          }))}
          label="Card Used"
          name="sourceId"
        />
        <FormRadioGroup
          options={[
            { label: "splurge", value: "splurge" },
            { label: "nice to have", value: "nice-to-have" },
            { label: "need", value: "need" },
          ]}
          label="Was this a"
          name="type"
        />
        <FormCategories
          options={[
            {
              color: "bg-green",
              value: "💰",
            },
            {
              color: "bg-red",
              value: "⛽️",
            },
            {
              color: "bg-yellow",
              value: "🚕",
            },
            {
              color: "bg-lime-100",
              value: "🍔",
            },
            {
              color: "bg-amber-700",
              value: "☕️",
            },
            {
              color: "bg-blue-200",
              value: "👕",
            },
            {
              color: "bg-neutral-300",
              value: "🏋🏻",
            },
            {
              color: "bg-violet-900",
              value: "🧾",
            },
          ]}
          label="Category"
          name="category"
        />
        <div className="mt-8 mb-6 flex flex-col gap-3">
          <button className="flex w-full flex-1 items-center justify-between rounded-lg bg-purple py-3 px-3 text-white">
            <span className="text-base font-semibold uppercase">create</span>
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
      </Form>
    </section>
  );
}
