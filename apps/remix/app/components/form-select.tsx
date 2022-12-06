import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { useState } from "react";

const FormSelect = ({
  label,
  name,
  options,
  className,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [selected, onSelect] = useState(options[0]);
  return (
    <div className="flex flex-col gap-1 text-white">
      <label className="text-lg font-medium">{label}</label>
      <Select.Root
        open={open}
        onOpenChange={(open) => setOpen(open)}
        name={name}
        value={selected.value}
        onValueChange={(v) => {
          const option = options.find((o) => o.value === v);

          if (option) {
            onSelect(option);
          }
        }}
      >
        <Select.Trigger
          className={clsx(
            "flex items-center justify-between rounded-lg bg-black-100 py-3 px-4",
            open ? "ring" : "",
            className
          )}
        >
          <Select.Value asChild className="flex items-center">
            <p className="text-lg font-medium text-white">{selected.label}</p>
          </Select.Value>
          <Select.Icon asChild>
            <ChevronDownIcon className="h-4 w-4 stroke-white stroke-[3]" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="z-[9999] min-w-fit rounded-xl bg-black-200 p-1 shadow-md">
            <Select.ScrollUpButton className="ml-auto mr-auto p-1">
              <ChevronUpIcon className="h-4 w-4 stroke-white stroke-2" />
            </Select.ScrollUpButton>
            <Select.Viewport>
              {options.map((option, index) => (
                <SelectItem
                  key={index}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="ml-auto mr-auto p-1">
              <ChevronDownIcon className="h-4 w-4 stroke-white stroke-2" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

const SelectItem = ({ label, value }: { label: string; value: string }) => (
  <Select.Item
    value={value}
    className="group flex w-full items-center justify-center gap-6 rounded-lg py-2 outline-none hover:bg-black-100 focus-visible:!outline-none"
  >
    <Select.ItemText>
      <p className="text-center text-lg font-medium text-white">{label}</p>
    </Select.ItemText>
  </Select.Item>
);

export { FormSelect };
