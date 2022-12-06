import { json } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import {
  differenceInCalendarDays,
  format,
  getDay,
  isToday,
  isYesterday,
  parse,
  startOfDay,
} from "date-fns";
import { useMemo } from "react";
import type { TrakrHandle, TrakrTransaction } from "types";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/home";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function useHasMatch(id: string) {
  const matchingRoutes = useMatches();
  return useMemo(
    () =>
      matchingRoutes.some((route) => (route.handle as TrakrHandle)?.id === id),
    [matchingRoutes, id]
  );
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function formatMoney(amount: number, decimals = true) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
}

export function groupTransactions(transactions: TrakrTransaction[]) {
  const groupedTransactions: Record<string, TrakrTransaction[]> = {};
  transactions.forEach((transaction) => {
    const date = startOfDay(new Date(transaction.createdAt));
    const key = format(date, "yyyy-MM-dd");
    if (!groupedTransactions[key]) {
      groupedTransactions[key] = [];
    }
    groupedTransactions[key].push(transaction);
  });

  const array = Object.entries(groupedTransactions).map(([key, value]) => {
    const transactions = value.sort((a, b) => {
      const aDate = Number(format(new Date(a.createdAt), "T"));
      const bDate = Number(format(new Date(b.createdAt), "T"));
      return aDate - bDate;
    });

    return {
      label: getRelativeDay(parse(key, "yyyy-MM-dd", new Date())),
      transactions,
    };
  });

  return array;
}

/**
 * Today
 * Yesterday
 * 2 days ago
 * Last ${dayOfWeek} (if it's within the week)
 * ${dayOfWeek}, ${month} ${dayOfMonth}
 */

export function getRelativeDay(date: Date) {
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (differenceInCalendarDays(new Date(), date) <= 7) {
    const day = getDay(date);
    switch (day) {
      case 0:
        return "Last Sunday";
      case 1:
        return "Last Monday";
      case 2:
        return "Last Tuesday";
      case 3:
        return "Last Wednesday";
      case 4:
        return "Last Thursday";
      case 5:
        return "Last Friday";
      case 6:
        return "Last Saturday";
      default:
        return "Unknown Day";
    }
  }
  return format(date, "EEEE, MMMM do");
}

export function badRequest<ActionData>(data: ActionData) {
  return json(data, { status: 400 });
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Unknown Error";
}

// Rapid Rewards Premier Card: You made a $18.74 transaction with TST* PRIME PIZZA - P on Oct 30, 2022 at 10:04 PM ET
// Chase Sapphire Preferred: You made a $15.93 transaction with UBER   *ALFALFA on Oct 30, 2022 at 1:04 PM ET.

export function parseTransactionText(text: string) {
  const [, transaction] = text.split("You made a $");
  const [amount, rest] = transaction.split(" transaction with ");
  const [merchant, date] = rest.split(" on ");
  const [day, timeWithTZ] = date.split(" at ");
  const [time] = timeWithTZ.split(" ET");

  const parsedDay = parse(day, "MMM dd, yyyy", new Date());
  const parsedTime = parse(time, "h:mm a", new Date());
  const hour = parsedTime.getHours();
  const minute = parsedTime.getMinutes();

  parsedDay.setHours(hour, minute);

  console.log(parsedDay.getTime());

  return {
    amount: Number(amount),
    merchant,
    rawDay: day,
    rawTime: time,
    day: parsedDay,
    hour,
    minute,
  };
}
