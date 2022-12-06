import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { TrakrSource } from "types";

import { db } from "~/utils/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.user.create({
    data: {
      email,
      name: "",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return db.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await db.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

const getUsersSources = async (userId: string) => {
  const sources = await db.source.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const results: TrakrSource[] = sources.map((source) => ({
    id: source.id,
    name: source.name,
    type: source.type,
    balance: source.balance,
    userId: source.userId,
  }));

  return results;
};

const updateUser = async ({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) => {
  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
    },
  });

  return user;
};

export { getUsersSources, updateUser };
