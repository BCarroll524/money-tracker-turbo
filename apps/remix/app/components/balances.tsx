import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { CreditCardIcon as CreditCardIconSolid } from "@heroicons/react/24/solid";
import type { TrakrSource } from "types";
import { formatMoney } from "~/utils";

const Balances = ({ sources }: { sources: TrakrSource[] }) => {
  const creditCards = sources.filter((source) => source.type === "credit_card");
  const debitCards = sources.filter((source) => source.type === "debit_card");
  const bankAccounts = sources.filter(
    (source) =>
      source.type === "checking_account" || source.type === "savings_account"
  );

  return (
    <section className="space-y-6 px-5 pt-5">
      <SourceGroup
        sources={creditCards}
        label="Credit Cards"
        icon={<CreditCardIcon className="h-7 w-7 stroke-blue-800" />}
      />
      <SourceGroup
        sources={debitCards}
        label="Debit Cards"
        icon={<CreditCardIconSolid className="h-7 w-7 stroke-cyan-700" />}
      />
      <SourceGroup
        sources={bankAccounts}
        label="Bank Accounts"
        icon={<BanknotesIcon className="h-7 w-7 stroke-green" />}
      />
    </section>
  );
};

const SourceGroup = ({
  sources,
  icon,
  label,
}: {
  sources: TrakrSource[];
  icon: React.ReactNode;
  label: string;
}) => {
  return sources.length ? (
    <section>
      <h2 className="pb-3 text-base font-semibold text-white">{label}</h2>
      {sources.map((source) => (
        <Source key={source.id} source={source} icon={icon} />
      ))}
    </section>
  ) : null;
};

const Source = ({
  source,
  icon,
}: {
  source: TrakrSource;
  icon: React.ReactNode;
}) => {
  const balance = (source.balance / 100).toFixed(2).toString().split(".");
  return (
    <article className="flex items-center gap-3 border-b border-gray-200 bg-black-100 px-3 py-3 first-of-type:rounded-t-lg last-of-type:rounded-b-lg last-of-type:border-b-0">
      {icon}
      <h4 className="flex-1 pr-6 text-base font-medium text-gray-100">
        {source.name}
      </h4>
      <p className="text-2xl tabular-nums text-white">
        <span className="-mb-[2px] pr-[1px] text-base">$</span>
        {formatMoney(Number(balance[0]), false)}
        <span className="text-base tabular-nums">.{balance[1]}</span>
      </p>
    </article>
  );
};

export { Balances };
