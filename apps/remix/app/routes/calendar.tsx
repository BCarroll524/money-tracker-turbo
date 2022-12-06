import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import {
  startOfToday,
  format,
  parse,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  add,
  isEqual,
  isSameMonth,
  isToday,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import useMeasure from "react-use-measure";
import type { TrakrHandle, TrakrTransaction } from "types";
import { Header } from "~/components/header";
import { MonthSpendingForCategory } from "~/components/spend-by-category";
import { getUsersTransactions } from "~/models/transaction.server";
import { formatMoney } from "~/utils";
import { useSSRLayoutEffect } from "~/utils/misc";
import { requireUser } from "~/utils/session.server";

export const handle: TrakrHandle & { id: string } = {
  id: "calendar",
  backgroundColor: "bg-black-300",
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const transactions = await getUsersTransactions(user.id);
  return json({
    transactions,
  });
};

export default function Calendar() {
  const data = useLoaderData<typeof loader>();
  const daysWithTransactions = sortTransactionsByDay(data.transactions);
  const [ref, bounds] = useMeasure();
  let today = startOfToday();
  let [selectedDay, setSelectedDay] = useState(today);
  let [currentMonth, setCurrentMonth] = useState(format(today, "MMMM"));
  let firstDayCurrentMonth = parse(currentMonth, "MMMM", new Date());

  let days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  const getNextPeriod = (duration: Duration) => {
    let firstDayNextMonth = add(firstDayCurrentMonth, duration);
    setCurrentMonth(format(firstDayNextMonth, "MMMM"));
  };

  const prev = usePrevious(currentMonth);

  let direction = "increasing";
  if (prev) {
    direction =
      parse(prev, "MMMM", new Date()) > parse(currentMonth, "MMMM", new Date())
        ? "decreasing"
        : "increasing";
  }

  const [height, setHeight] = useState(0);
  useSSRLayoutEffect(() => {
    setHeight(bounds.height);
  }, [bounds.height]);

  const groupedTransactions = groupTransactionsByLabel(
    data.transactions,
    firstDayCurrentMonth
  );

  const monthSum = groupedTransactions.reduce((acc, { sum }) => acc + sum, 0);
  const maxGroupAmount = Math.max(...groupedTransactions.map((g) => g.sum));

  return (
    <main className="relative">
      <Header />
      <section className="sticky top-16 mt-16 h-fit w-full bg-black-300 px-5 pt-2">
        <div className="flex items-center gap-2 pb-3">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-gray-300 bg-black-100  text-center "
            onClick={() => getNextPeriod({ months: -1 })}
          >
            <ChevronLeftIcon className="h-3 w-3 stroke-white stroke-2" />
          </button>
          <div className="flex-1 text-center text-base font-medium text-white">
            {currentMonth}
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md  border-2 border-gray-300 bg-black-100"
            onClick={() => getNextPeriod({ months: 1 })}
          >
            <ChevronRightIcon className="h-3 w-3 stroke-white stroke-2" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-7 gap-4 text-center text-sm text-gray-100">
          <p>Su</p>
          <p>Mo</p>
          <p>Tu</p>
          <p>We</p>
          <p>Th</p>
          <p>Fr</p>
          <p>Sa</p>
        </div>
        <div
          className={clsx("relative overflow-hidden", `h-[${height}px]`)}
          style={{ height: bounds.height }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.section
              ref={ref}
              key={currentMonth}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              transition={{ duration: 0.5, type: "spring" }}
              className="absolute w-full pb-3"
            >
              <div className="grid grid-cols-7 gap-x-4 gap-y-1 text-center text-sm">
                {days.map((day) => (
                  <div
                    className="relative mb-2 flex flex-col items-center"
                    key={day.toString()}
                  >
                    <AspectRatio.Root
                      ratio={1}
                      // key={day.toString()}
                      className={clsx(
                        // dayIdx === 0 && colStartClasses[getDay(day)],
                        isEqual(day, selectedDay) && "text-white",
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "text-blue-500",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-white",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-200",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-blue-500",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-white text-black-300",
                        !isEqual(day, selectedDay) && "hover:bg-gray-100",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "ml-auto mr-auto flex h-8 w-8 items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-100 ease-in-out"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className="h-full w-full"
                      >
                        <time dateTime={format(day, "yyyy-MM-dd")}>
                          {format(day, "d")}
                        </time>
                      </button>
                    </AspectRatio.Root>
                    {daysWithTransactions.find(
                      (transDate) => format(day, "yyyy-MM-dd") === transDate
                    ) ? (
                      <div className="absolute bottom-0 left-0 right-0 mx-auto h-1 w-1 rounded-full bg-purple" />
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>
        <div className="-mx-5 border-b-[6px] border-black-100" />
      </section>

      <section className="px-5 pt-5">
        <div className="flex items-baseline justify-between pb-4">
          <h2 className="text-lg font-medium text-white">
            Spending this month
          </h2>
          <h2 className="text-lg font-semibold text-white">
            {formatMoney(monthSum / 100)}
          </h2>
        </div>
        <div className="space-y-4">
          {groupedTransactions.map((group, groupIdx) => (
            <MonthSpendingForCategory
              key={groupIdx}
              label={group.label}
              amount={group.sum}
              max={maxGroupAmount}
              className="bg-purple"
            />
          ))}
        </div>
      </section>
    </main>
  );
}

const variants = {
  enter: (direction: "increasing" | "decreasing") => ({
    x: direction === "increasing" ? "100%" : "-100%",
  }),
  center: { x: 0 },
  exit: (direction: "increasing" | "decreasing") => ({
    x: direction === "increasing" ? "-100%" : "100%",
  }),
};

function usePrevious<StateType>(value: StateType) {
  const [tuple, setTuple] = useState([null, value]); // [ prev, current ]

  if (tuple[1] !== value) {
    setTuple([tuple[1], value]);
  }

  return tuple[0];
}

function sortTransactionsByDay(transactions: TrakrTransaction[]) {
  const days = transactions.map((transaction) => {
    return format(new Date(transaction.createdAt), "yyyy-MM-dd");
  });

  return Array.from(new Set(days));
}

function groupTransactionsByLabel(
  transactions: TrakrTransaction[],
  startOfMonth: Date
) {
  const labeledTransactions = transactions
    .filter((transaction) =>
      isSameMonth(new Date(transaction.createdAt), startOfMonth)
    )
    .reduce(
      (acc, transaction) => {
        const label = transaction.label;
        if (acc[label]) {
          acc[label].sum += transaction.amount;
        } else {
          acc[label] = {
            sum: transaction.amount,
            label: transaction.label,
          };
        }
        return acc;
      },
      {} as Record<
        string,
        {
          sum: number;
          label: string;
        }
      >
    );

  return Object.values(labeledTransactions).sort((a, b) => b.sum - a.sum);
}
