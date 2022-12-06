import type { TrakrTransaction } from "types";
import { db } from "~/utils/db.server";

const getTotalSpent = async (userId: string) => {
  const total = await db.transaction.aggregate({
    where: {
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  return total._sum.amount || 0;
};

const getUsersTransactions = async (userId: string) => {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const result: TrakrTransaction[] = transactions.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount,
    name: transaction.name,
    label: transaction.label,
    type: transaction.type,
    createdAt: transaction.createdAt.toISOString(),
    userId: transaction.userId,
  }));

  return result;
};

const createTransaction = async ({
  name,
  amount,
  sourceId,
  type,
  label,
  userId,
  date,
}: {
  name: string;
  amount: number;
  sourceId: string;
  type: string;
  label: string;
  userId: string;
  date: Date;
}) => {
  const transaction = await db.transaction.create({
    data: {
      name,
      amount,
      sourceId,
      type,
      label,
      userId,
      createdAt: date,
    },
  });

  await db.source.update({
    where: { id: sourceId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  return transaction;
};

export { getTotalSpent, getUsersTransactions, createTransaction };
