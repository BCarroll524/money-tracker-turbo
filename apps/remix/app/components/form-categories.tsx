import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import clsx from "clsx";

const FormCategories = ({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: Array<{ color: string; value: string }>;
}) => {
  return (
    <div className="flex max-w-full flex-col gap-3 text-white">
      <label className="text-lg font-medium">{label}</label>
      <RadioGroupPrimitive.Root
        name={name}
        required
        defaultValue={options[0].value}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => (
          <CategoryItem key={option.value} {...option} />
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
};

const CategoryItem = ({ color, value }: { color: string; value: string }) => {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      id={value}
      className={clsx(
        "relative flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-lg",
        color
      )}
    >
      <RadioGroupPrimitive.Indicator className="absolute -inset-1 rounded-[10px] border-2  border-blue-400" />
      <label className="text-2xl" htmlFor={value}>
        {value}
      </label>
    </RadioGroupPrimitive.Item>
  );
};

export { FormCategories };
