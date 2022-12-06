import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { useState } from "react";

const FormRadioGroup = ({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
}) => {
  const [selected, setSelected] = useState(options[0].value);
  return (
    <div className="flex flex-col gap-2 text-white">
      <label className="text-lg font-medium">{label}</label>
      <RadioGroupPrimitive.Root
        name={name}
        required
        defaultValue={options?.[0].value}
        onValueChange={(val) => setSelected(val)}
        className="flex rounded-xl bg-black-200 p-[6px]"
      >
        {options.map((option) => (
          <RadioItem key={option.value} {...option} selected={selected} />
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
};

const RadioItem = ({
  label,
  value,
  selected,
}: {
  selected: string;
  label: string;
  value: string;
}) => {
  const isSelected = selected === value;
  return (
    <div className="flex-1">
      <RadioGroupPrimitive.Item
        value={value}
        id={value}
        className="group relative w-full cursor-pointer px-4 py-2"
      >
        <RadioGroupPrimitive.Indicator className="absolute inset-0 rounded-md bg-black-100" />
        <label
          className={clsx(
            "relative whitespace-nowrap text-center font-inter text-base font-medium transition-colors duration-100 ease-out",
            isSelected ? "text-white" : "text-white"
          )}
          htmlFor={value}
        >
          {label}
        </label>
      </RadioGroupPrimitive.Item>
    </div>
  );
};

export { FormRadioGroup };
