import { db } from "~/utils/db.server";

const addBalance = async ({
  balance,
  sourceId,
}: {
  balance: number;
  sourceId: string;
}) => {
  const source = await db.source.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    throw new Error("Unexpected error: source not found.");
  }

  const updatedBalance = source.type === "credit_card" ? balance * -1 : balance;

  await db.source.update({
    where: { id: sourceId },
    data: { balance: updatedBalance },
  });
};

export { addBalance };
