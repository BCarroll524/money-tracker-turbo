import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { TrakrHandle } from "types";
import { FormCategories } from "~/components/form-categories";
import { FormRadioGroup } from "~/components/form-radio";
import { FormSelect } from "~/components/form-select";
import { FormTextarea } from "~/components/form-textarea";
import { Header } from "~/components/header";
import { parseTransactionText } from "~/utils";
import { requireUser } from "~/utils/session.server";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUsersSources } from "~/models/user.server";
import { createTransaction } from "~/models/transaction.server";
import { getErrorMessage } from "~/utils";

export const handle: TrakrHandle & { id: string } = {
  id: "text-transaction",
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

export default function TextTransaction() {
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [value, setValue] = useState<string | undefined>(undefined);
  const [parsedValue, setParsedValue] = useState<
    ReturnType<typeof parseTransactionText> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedValue) {
      try {
        const parsed = parseTransactionText(debouncedValue);
        setParsedValue(parsed);
        setError(undefined);
      } catch (e) {
        setParsedValue(undefined);
        setError(
          "Error parsing text. Please make sure it is formatted correctly.\nEx: Credit Card: You made a $10.00 transaction with MERCHANT on Jan 1, 2022 at 12:00 PM ET"
        );
      }
    }
  }, [debouncedValue]);

  return (
    <section className="min-h-full px-5 pt-[72px] pb-8">
      <Header />
      <h1 className="pb-3 text-2xl font-medium text-white">
        Add Transaction From Text
      </h1>
      {error ? (
        <p className="whitespace-pre-wrap pb-2 text-base text-red">{error}</p>
      ) : null}
      {actionData?.error ? (
        <p className="pb-2 text-base text-red">{actionData.error}</p>
      ) : null}

      {!parsedValue ? (
        <FormTextarea
          name="text"
          placeholder="Enter text to parse"
          required
          onChange={(e) => {
            const value = e.currentTarget.value;
            setValue(value);
          }}
          className={
            parsedValue ? "border-2 border-green focus:outline-none" : ""
          }
        />
      ) : (
        <section className="mt-3">
          <div className="flex justify-between pb-1">
            <h3 className="text-lg font-medium text-white">Transaction</h3>
            <button
              type="button"
              onClick={() => {
                setParsedValue(undefined);
                setValue(undefined);
              }}
              className="text-sm text-red active:opacity-50"
            >
              clear
            </button>
          </div>
          <div className="mb-4 space-y-2 rounded-lg bg-black-100 p-4 text-white">
            <div className="flex justify-between">
              <p className="text-gray-100">Name</p>
              <p>{parsedValue.merchant}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-100">Amount</p>
              <p>{parsedValue.amount}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-100">Date</p>
              <p>{format(parsedValue.day, "EEE, MMMM do, yyyy")}</p>
            </div>
          </div>
          <fetcher.Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="name" value={parsedValue.merchant} />
            <input type="hidden" name="amount" value={parsedValue.amount} />
            <input
              type="hidden"
              name="date"
              value={format(parsedValue.day, "T")}
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
            <div className="mt-8 flex flex-col gap-3">
              <button className="flex w-full flex-1 items-center justify-between rounded-lg bg-purple py-3 px-3 text-white">
                <span className="text-base font-semibold uppercase">
                  create
                </span>
                <CheckIcon className="h-5 w-5 stroke-white" />
              </button>
              <Link
                to="/home"
                className="flex w-full flex-1 items-center justify-between rounded-lg bg-black-100 py-3 px-3 text-white"
              >
                <span className="text-base font-semibold uppercase">
                  cancel
                </span>
                <XMarkIcon className="h-5 w-5 stroke-white" />
              </Link>
            </div>
          </fetcher.Form>
        </section>
      )}
    </section>
  );
}

function useDebounce(value: string | undefined, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
