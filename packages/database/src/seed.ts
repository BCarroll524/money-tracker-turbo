import bcrypt from "bcryptjs";
import { db } from "./client";
import { seedTransaction } from "./seed-transactions";

async function seed() {
  const email = "blake@remix.run";

  // cleanup the existing database
  await db.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("blakeiscool", 10);

  const user = await db.user.create({
    data: {
      email,
      name: "Blake",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // lets add a couple transactions
  await db.source.create({
    data: {
      name: "Chase Sapphire Preferred",
      type: "credit_card",
      userId: user.id,
      balance: -100000,
    },
  });

  await db.source.create({
    data: {
      name: "Rapid Rewards Premier Card",
      type: "credit_card",
      userId: user.id,
      balance: -25000,
    },
  });

  await db.source.create({
    data: {
      name: "Wells Fargo Checking Account",
      type: "checking_account",
      userId: user.id,
      balance: 140000,
    },
  });

  await db.source.create({
    data: {
      name: "Wells Fargo Savings Account",
      type: "savings_account",
      userId: user.id,
      balance: 5000,
    },
  });

  const sources = await db.source.findMany();

  for (let i = 0; i < 50; i++) {
    await seedTransaction(
      user.id,
      sources.map((s) => s.id)
    );
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
