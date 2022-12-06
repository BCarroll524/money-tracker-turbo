import { CreditCardIcon } from "@heroicons/react/24/outline";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";
import type { SourceType } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { TrakrHandle, TrakrSource } from "types";
import { FormInput } from "~/components/form-input";
import { FormSelect } from "~/components/form-select";
import { addPaymentToUser } from "~/models/sources.server";
import { getUsersSources, updateUser } from "~/models/user.server";
import { requireUser } from "~/utils/session.server";

export const handle: TrakrHandle & { id: string } = {
  id: "onboarding",
  backgroundColor: "bg-black-100",
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const paymentMethods = await getUsersSources(user.id);

  return json({ paymentMethods, name: user.name });
};

export const action = async ({ request }: ActionArgs) => {
  const form = new URLSearchParams(await request.text());

  const action = form.get("_action");
  if (action === "onboarding") {
    const page = form.get("page");
    return redirect(`/welcome?page=${page}`);
  }

  if (action === "user-name") {
    const user = await requireUser(request);
    const name = form.get("fullName") || "";
    const page = form.get("page");
    await updateUser({ userId: user.id, name });
    return redirect(`/welcome?page=${page}`);
  }

  if (action === "add-payment") {
    const user = await requireUser(request);
    const paymentNickname = form.get("paymentNickname") || "";
    const paymentType = form.get("type");
    await addPaymentToUser({
      userId: user.id,
      name: paymentNickname,
      type: paymentType as SourceType,
    });

    return redirect(`/welcome?page=3`);
  }

  if (action === "complete-payment") {
    const user = await requireUser(request);
    const paymentMethods = await getUsersSources(user.id);
    if (paymentMethods.length) {
      return redirect("/home");
    }
    return redirect("/welcome?page=3");
  }

  return null;
};

export default function Welcome() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  return (
    <section className="flex min-h-full flex-col pt-20 pb-[75px]">
      <h1 className="text-center text-4xl font-semibold text-white">
        Transaction Tracker
      </h1>

      {page === 1 ? (
        <Welcome1 />
      ) : page === 2 ? (
        <Welcome2 defaultName={data.name} />
      ) : (
        <Welcome3 paymentMethods={data.paymentMethods} />
      )}
    </section>
  );
}

const OnboardingNav = ({
  nextDisabled,
  page,
}: {
  nextDisabled?: boolean;
  page: number;
}) => {
  const navigate = useNavigate();
  const nextText = page === 3 ? "Finish" : "Next";
  return (
    <div className="flex w-full items-center px-8">
      <p
        className="text-lg font-semibold text-purple"
        onClick={() => navigate(-1)}
      >
        Back
      </p>
      <Pagination page={page} />
      {nextDisabled ? (
        <p className="text-lg font-semibold text-gray-100">{nextText}</p>
      ) : (
        <button
          form="welcome-form"
          type="submit"
          className="text-lg font-semibold text-white"
        >
          {nextText}
        </button>
      )}
    </div>
  );
};

const Pagination = ({ page }: { page: number }) => {
  const getClassNames = (index: number) => {
    const isActive = index === page;
    return clsx(
      "rounded-sm bg-white",
      isActive ? "w-[10px] h-[10px]" : "w-2 h-2 opacity-40"
    );
  };
  return (
    <div className="flex flex-1 items-center justify-center gap-1">
      <div className={getClassNames(1)} />
      <div className={getClassNames(2)} />
      <div className={getClassNames(3)} />
    </div>
  );
};

const Welcome1 = () => {
  return (
    <>
      <div className="flex-1 px-8 text-white">
        <div className="px-2 pt-[88px] pb-[82px]">
          <img src="/images/welcome-1.png" alt="Welcome 1" />
        </div>
        <h2 className="pb-2 text-center text-xl font-semibold">
          Spend Smarter 🥳
        </h2>
        <p className="mx-auto max-w-[280px] text-center text-base font-normal">
          Everyone wants more financially. We are here to help you start! We do
          this by allowing you to keep track of your spending and being able to
          visualize your habits.
        </p>
        <Form method="post" id="welcome-form">
          <input type="hidden" name="page" value="2" />
          <input type="hidden" name="_action" value="onboarding" />
        </Form>
      </div>
      <OnboardingNav page={1} />
    </>
  );
};

const Welcome2 = ({ defaultName }: { defaultName: string | undefined }) => {
  const [name, setName] = useState(defaultName || "");
  return (
    <>
      <div className="flex-1 text-white">
        <div className="px-10 pt-[88px] pb-[82px]">
          <img src="/images/welcome-2.png" alt="Welcome 2" />
        </div>
        <h2 className="pb-2 text-center text-xl font-semibold">
          Let's get started
        </h2>
        <Form
          method="post"
          className="px-5"
          id="welcome-form"
          onChange={(e) => {
            const form = e.currentTarget;
            setName(form.fullName.value);
          }}
        >
          <input type="hidden" name="page" value="3" />
          <input type="hidden" name="_action" value="user-name" />
          <FormInput
            name="fullName"
            label="Name"
            placeholder="John Doe"
            autoFocus
            defaultValue={name}
            className="bg-black-200"
          />
        </Form>
      </div>
      <OnboardingNav page={2} nextDisabled={!name} />
    </>
  );
};

const Welcome3 = ({ paymentMethods }: { paymentMethods: TrakrSource[] }) => {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState({
    paymentNickname: "",
    type: "credit_card",
  });
  const isFormComplete = formValues.paymentNickname && formValues.type;
  const nextDisabled = !paymentMethods.length;

  const isSubmitting = fetcher.state === "submitting";
  useEffect(() => {
    if (!isSubmitting) {
      formRef.current?.reset();
      nicknameRef.current?.focus();
    }
  }, [isSubmitting]);
  return (
    <>
      <div className="flex-1 text-white">
        <div className="pt-9 pb-6">
          <img
            src="/images/welcome-3.png"
            alt="Welcome 3"
            className={clsx(
              "mx-auto w-auto object-contain",
              paymentMethods.length ? "max-h-28" : "max-h-[160px]"
            )}
          />
        </div>
        <div className="pb-5">
          <h2 className="text-center text-xl font-semibold">
            Now, lets add a payment type
          </h2>
          <p className="text-center text-base font-normal text-gray-100">
            This is only used to label transactions
          </p>
        </div>
        <fetcher.Form
          ref={formRef}
          method="post"
          id="welcome-form"
          className="flex flex-col gap-4 px-5"
          onChange={(e) => {
            const form = e.currentTarget;
            setFormValues({
              paymentNickname: form.paymentNickname.value,
              type: form.type.value,
            });
          }}
        >
          <PaymentMethods paymentMethods={paymentMethods} />
          <input type="hidden" name="_action" value="complete-payment" />
          <FormInput
            ref={nicknameRef}
            name="paymentNickname"
            label="Payment Nickname"
            placeholder="Chase Credit Card"
            className="bg-black-200"
          />
          <FormSelect
            name="type"
            label="Payment Type"
            className="bg-black-200"
            options={[
              { label: "Credit Card", value: "credit_card" },
              {
                label: "Debit Card",
                value: "debit_card",
              },
              {
                label: "Bank Account",
                value: "bank_account",
              },
            ]}
          />
          <button
            type="button"
            disabled={!isFormComplete}
            className="text-center text-base font-medium text-blue-500 disabled:text-blue-900"
            onClick={() =>
              fetcher.submit(
                {
                  _action: "add-payment",
                  paymentNickname: formValues.paymentNickname,
                  type: formValues.type,
                },
                {
                  method: "post",
                }
              )
            }
          >
            add payment
          </button>
        </fetcher.Form>
      </div>
      <OnboardingNav page={3} nextDisabled={nextDisabled} />
    </>
  );
};

const PaymentMethods = ({
  paymentMethods,
}: {
  paymentMethods: TrakrSource[];
}) => {
  if (paymentMethods.length) {
    return (
      <div className="py-2">
        {paymentMethods.map((paymentMethod, index) => (
          <PaymentMethod
            key={index}
            name={paymentMethod.name}
            type={paymentMethod.type}
            isTop={index === 0}
            isBottom={index === paymentMethods.length - 1}
            index={index}
          />
        ))}
      </div>
    );
  }

  return null;
};

const PaymentMethod = ({
  name,
  type,
  isTop,
  isBottom,
  index,
}: {
  name: string;
  type: string;
  isTop: boolean;
  isBottom: boolean;
  index: number;
}) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between px-3 py-2 text-white",
        isTop ? "rounded-t-[4px]" : "",
        isBottom ? "rounded-b-[4px]" : "",
        index % 2 === 0 ? "bg-sky-800" : "bg-purple"
      )}
    >
      {type === "bank_account" ? (
        <BuildingLibraryIcon className="h-5 w-5" />
      ) : (
        <CreditCardIcon className="h-5 w-5" />
      )}
      <p className="text-lg font-medium">{name}</p>
    </div>
  );
};
