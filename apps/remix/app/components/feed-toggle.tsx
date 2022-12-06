import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Form, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRef } from "react";

const FeedToggle = ({ show }: { show: string }) => {
  const ref = useRef<HTMLFormElement>(null);
  const isFeed = show === "feed";
  const submit = useSubmit();

  return (
    <Form
      method="get"
      ref={ref}
      onChange={() =>
        submit(ref.current, {
          action: "/home",
        })
      }
    >
      <RadioGroupPrimitive.Root
        name="show"
        required
        defaultValue={isFeed ? "feed" : "balance"}
        className="relative mx-5 mt-5 flex rounded-full bg-black-100 p-1"
      >
        <motion.div
          layout
          transition={{ type: "spring", duration: 0.3 }}
          className={clsx(
            "absolute top-0 bottom-0 w-1/2 p-1",
            isFeed ? "left-0" : "right-0"
          )}
        >
          <div className="h-full w-full rounded-full bg-purple" />
        </motion.div>
        <RadioGroupPrimitive.Item
          value="feed"
          id="feed"
          className="relative flex-1 rounded-full py-[6px] text-center text-white"
        >
          Feed
        </RadioGroupPrimitive.Item>
        <RadioGroupPrimitive.Item
          value="balance"
          id="balance"
          className="relative flex-1 rounded-full py-[6px] text-center text-white"
        >
          Balances
        </RadioGroupPrimitive.Item>
      </RadioGroupPrimitive.Root>
    </Form>
  );
};

export { FeedToggle };
