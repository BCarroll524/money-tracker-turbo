import clsx from "clsx";
import { formatMoney } from "~/utils";

const MonthSpendingForCategory = ({
  label,
  amount,
  max,
  className,
}: {
  label: string;
  amount: number;
  max: number;
  className?: string;
}) => {
  const widthPercent = Math.round((amount / max) * 90); // want this to only every be 90%

  return (
    <article className="flex items-center gap-3">
      <div className="relative rounded-md bg-black-100 p-3">
        <span className="absolute scale-110 text-xl leading-none  opacity-50 blur-sm">
          {label}
        </span>
        <div className="relative text-xl leading-none">{label}</div>
      </div>
      <div
        className={clsx(
          `flex h-5 items-center justify-end rounded-full`,
          className
        )}
        style={{ width: `${widthPercent}%` }}
      >
        {widthPercent > 50 ? (
          <p className="px-2 text-right text-xs font-medium tabular-nums leading-none text-white">
            {formatMoney(amount / 100)}
          </p>
        ) : null}
      </div>
      {widthPercent <= 50 ? (
        <p className="-ml-1 text-sm font-medium tabular-nums leading-none text-white">
          {formatMoney(amount / 100)}
        </p>
      ) : null}
    </article>
  );
};

export { MonthSpendingForCategory };
