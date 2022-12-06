import clsx from "clsx";
import { forwardRef } from "react";

type Props = {
  label: string;
  name: string;
  type?: "text" | "number";
  placeholder: string;
  className?: string;
} & React.HTMLProps<HTMLInputElement>;

type Ref = HTMLInputElement;

// eslint-disable-next-line react/display-name
const FormInput = forwardRef<Ref, Props>(
  ({ label, type, name, placeholder, className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1 text-white">
        <label className="text-lg font-medium">{label}</label>
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          className={clsx(
            "rounded-lg bg-black-100 py-3 px-4 font-inter placeholder:text-gray-200 focus:ring-purple",
            className
          )}
          {...rest}
        />
      </div>
    );
  }
);

export { FormInput };
