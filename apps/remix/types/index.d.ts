type TrakrTransaction = {
  id: string;
  name: string;
  amount: number;
  label: string;
  type: string;
  createdAt: string;
  userId: string;
};

type TrakrHandle = {
  id?: string;
  /** this is here to allow us to disable scroll restoration until Remix gives us better control */
  restoreScroll?: false;
  dynamicLinks?: DynamicLinksFunction;
  backgroundColor?: string;
};

type TrakrSource = {
  id: string;
  name: string;
  type: "debit_card" | "credit_card" | "checking_account" | "savings_account";
  balance: number;
  userId: string;
  transactions?: TrakrTransaction[];
};

export { TrakrTransaction, TrakrHandle, TrakrSource };
