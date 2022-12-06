import { ArrowSmallRightIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { startOfDay } from "date-fns";
import { useEffect } from "react";
import type { TrakrHandle, TrakrTransaction } from "types";
import { Balances } from "~/components/balances";
import { FeedToggle } from "~/components/feed-toggle";
import { Header } from "~/components/header";
import { TransactionsGrouped } from "~/components/transactions-grouped";
import {
  getTotalSpent,
  getUsersTransactions,
} from "~/models/transaction.server";
import { getUsersSources } from "~/models/user.server";
import { formatMoney, groupTransactions } from "~/utils";
import { requireUser } from "~/utils/session.server";

export const handle: TrakrHandle & { id: string } = {
  id: "home",
  backgroundColor: "bg-black-300",
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  const [transactions, totalSpent, sources] = await Promise.all([
    getUsersTransactions(user.id),
    getTotalSpent(user.id),
    getUsersSources(user.id),
  ]);

  const url = new URL(request.url);
  const newTransactionId = url.searchParams.get("tId");
  const show = url.searchParams.get("show") || "feed";

  return json({
    totalSpent,
    transactions,
    sources,
    newTransactionId,
    show,
  });
};

const getSpendingDiff = (transactions: TrakrTransaction[]) => {
  const today = startOfDay(new Date());
  const transactionsFromToday = transactions.filter(
    (transaction) => new Date(transaction.createdAt) > today
  );

  const totalSpentToday = transactionsFromToday.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  return totalSpentToday;
};

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const spendingDiff = getSpendingDiff(data.transactions);
  const totalSpent = (data.totalSpent / 100).toFixed(2).toString().split(".");
  const transactionGroups = groupTransactions(data.transactions);

  useEffect(() => {
    if (data.newTransactionId) {
      const element = document.getElementById(data.newTransactionId);
      // document.e
      element?.scrollIntoView({ behavior: "smooth" });
      element?.focus();
    }
  }, [data.newTransactionId]);

  return (
    <>
      <Header title="Money Account" />
      <main className="isolate">
        <div className="isolation flex flex-col items-center justify-center pt-[68px] text-white">
          <p className="text-4xl font-medium tabular-nums tracking-wide">
            <span className="pr-[2px] text-lg">$</span>
            {formatMoney(Number(totalSpent[0]), false)}
            <span className="text-lg">.{totalSpent[1]}</span>
          </p>
          <p className="text-sm font-semibold text-green">
            + <span className="pr-[2px] text-xs">$</span>
            {formatMoney(spendingDiff / 100)} - Today
          </p>
        </div>
        <Link
          prefetch="render"
          to="/transaction/new"
          className="mx-auto mt-3 mb-5 flex w-fit items-center justify-center gap-2 rounded-lg bg-black-100 py-1 px-3"
        >
          <p className="text-base font-semibold uppercase text-white">
            add transaction
          </p>
          <ArrowSmallRightIcon className="h-4 w-4 fill-white stroke-white" />
        </Link>
        <div className="w-full border-t-2 border-gray-200" />
        <FeedToggle show={data.show} />

        {data.show === "feed" ? (
          <div>
            {data.transactions.length ? (
              transactionGroups.map((groups, index) => (
                <TransactionsGrouped
                  key={index}
                  transactions={groups.transactions}
                  dateLabel={groups.label}
                />
              ))
            ) : (
              <p className="px-6 pt-5 text-center text-lg font-medium text-white">
                You have not recorded any transactions yet. Click the button
                above to add to today's spending!
              </p>
            )}
          </div>
        ) : (
          <Balances sources={data.sources} />
        )}
      </main>
    </>
  );
}
