import type { SourceType } from "@prisma/client";
import { db } from "~/utils/db.server";

const addPaymentToUser = async ({
  userId,
  name,
  type,
}: {
  userId: string;
  name: string;
  type: SourceType;
}) => {
  const payment = await db.source.create({
    data: {
      name,
      type,
      userId,
    },
  });

  return payment;
};

export { addPaymentToUser };
