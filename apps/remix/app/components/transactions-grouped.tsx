import type { TrakrTransaction } from "types";
import { formatMoney } from "~/utils";
import { TransactionLineItem } from "./transaction-line-item";

const TransactionsGrouped = ({
  transactions,
  dateLabel,
}: {
  transactions: TrakrTransaction[];
  dateLabel: string;
}) => {
  const sum = transactions.reduce((acc, transaction) => {
    return acc + transaction.amount;
  }, 0);
  return (
    <section className="px-5 pt-3 even:bg-black-200">
      <div className="flex items-baseline justify-between pb-4">
        <h2 className="text-base font-semibold text-white">{dateLabel}</h2>
        <h2 className="text-lg font-semibold text-white">
          <span className="pr-[1px] text-sm">$</span>
          {formatMoney(sum / 100)}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {transactions.map((transaction) => (
          <TransactionLineItem transaction={transaction} key={transaction.id} />
        ))}
      </div>
      <div className="mt-3 w-full border-t border-gray-200" />
    </section>
  );
};

export { TransactionsGrouped };
