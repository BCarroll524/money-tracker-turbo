import {
  ArrowPathIcon,
  ArrowRightIcon,
  Bars3Icon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";
import { Form, Link } from "@remix-run/react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeftOnRectangleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useOptionalUser } from "~/utils";
import clsx from "clsx";

const Header = ({ title }: { title?: string }) => {
  const user = useOptionalUser();
  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-[1] flex items-center justify-between p-4",
        user && "backdrop-blur-[2px]"
      )}
    >
      <Link
        to="/home"
        prefetch="render"
        className="flex-1 text-4xl font-semibold"
      >
        💸
      </Link>
      {title ? (
        <h1 className="text-lg font-medium text-gray-100">{title}</h1>
      ) : null}
      {user ? (
        <div className="flex flex-1 justify-end">
          <MobileMenu />
        </div>
      ) : null}
    </header>
  );
};

export { Header };

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  const variants = {
    hide: {
      opacity: 0,
      y: -15,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Dialog.Root open={open} onOpenChange={(val) => setOpen(val)}>
      <Dialog.Trigger>
        <Bars3Icon className="h-6 w-6 fill-white stroke-white" />
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay />
            <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                className="fixed inset-0 z-[2] bg-black-100 px-5 pt-9"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="mb-8 flex items-center gap-4"
                >
                  <div className="rounded-xl bg-black-300 p-2">
                    <ChevronLeftIcon className="h-5 w-5 fill-white stroke-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-white">
                    My Account
                  </h1>
                </button>
                <motion.div
                  initial="hide"
                  animate="show"
                  transition={{ delay: 0.4, staggerChildren: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <MenuItem
                    to="/transaction/text"
                    title="Add Transaction From Text"
                    variants={variants}
                    icon={
                      <DocumentTextIcon className="h-5 w-5  stroke-white" />
                    }
                  />
                  <MenuItem
                    to="/home"
                    title="Add Recurring Transaction"
                    variants={variants}
                    icon={
                      <ArrowPathIcon className="h-5 w-5 fill-white stroke-white" />
                    }
                  />
                  <MenuItem
                    to="/balances/add"
                    title="Add Balances"
                    variants={variants}
                    icon={<BanknotesIcon className="h-5 w-5  stroke-white" />}
                  />
                  <MenuItem
                    to="/calendar"
                    title="Calendar View"
                    variants={variants}
                    icon={
                      <CalendarDaysIcon className="h-5 w-5  stroke-white" />
                    }
                  />
                  <Logout variants={variants} />
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
};

const MenuItem = ({
  icon,
  title,
  to,
  variants,
}: {
  icon: React.ReactNode;
  title: string;
  to: string;
  variants: Variants;
}) => {
  return (
    <motion.div variants={variants}>
      <Link
        prefetch="render"
        to={to}
        className="flex items-center justify-between rounded-lg bg-black-200 px-3 py-4"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="text-base font-medium text-white">{title}</h4>
        </div>
        <ArrowRightIcon className="h-5 w-5 fill-white stroke-white" />
      </Link>
    </motion.div>
  );
};

const Logout = ({ variants }: { variants: Variants }) => {
  return (
    <motion.div variants={variants}>
      <Form method="post" action="/logout">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg bg-black-200 px-3 py-4"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 stroke-red" />
          <h4 className="text-base font-medium text-red">Logout</h4>
        </button>
      </Form>
    </motion.div>
  );
};
