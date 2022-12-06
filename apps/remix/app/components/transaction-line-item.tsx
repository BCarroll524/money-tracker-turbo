import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import type { TrakrTransaction } from "types";
import { formatMoney } from "~/utils";

const TransactionLineItem = ({
  transaction,
}: {
  transaction: TrakrTransaction;
}) => {
  const [searchParams] = useSearchParams();
  const newTransactionId = searchParams.get("tId");
  const isNew = newTransactionId === transaction.id;

  return (
    <article className="flex items-center gap-3">
      <span id={transaction.id} className="-mt-48 -ml-3 pb-48" />
      <div className="relative rounded-md bg-black-100 p-3">
        <span className="absolute scale-110 text-xl leading-none  opacity-50 blur-sm">
          {transaction.label}
        </span>
        <div className="relative text-xl leading-none">{transaction.label}</div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="pb-1 text-base font-medium text-gray-100">
            {transaction.name}
            {isNew ? (
              <span className="ml-4 rounded-md bg-emerald-300 px-1 py-1 text-xs font-medium uppercase text-white">
                new
              </span>
            ) : null}
          </h3>
          <h3 className="text-base font-medium tabular-nums text-gray-100">
            <span className="pr-[1px] text-xs">$</span>
            {formatMoney(transaction.amount / 100)}
          </h3>
        </div>
        <div
          className={clsx(
            "ml-auto mr-4 h-[10px] w-[10px] rounded-full bg-white",
            transaction.type === "need"
              ? "bg-green"
              : transaction.type === "nice-to-have"
              ? "bg-yellow"
              : "bg-red"
          )}
        />
        {/* <p
            className={clsx(
              transaction.type === "need"
                ? "bg-green"
                : transaction.type === "nice-to-have"
                ? "bg-yellow"
                : "bg-red",
              "w-fit rounded-full px-2 py-1 text-xs font-medium text-white"
            )}
          >
            {transaction.type}
          </p> */}
      </div>
    </article>
  );
};

export { TransactionLineItem };
