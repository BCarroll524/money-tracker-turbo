import clsx from "clsx";

type Props = {
  label?: string;
  name: string;
  placeholder: string;
  className?: string;
} & React.HTMLProps<HTMLTextAreaElement>;

const FormTextarea = ({
  label,
  name,
  placeholder,
  className,
  ...rest
}: Props) => {
  return (
    <div className="flex flex-col gap-2 text-white">
      {label && <label className="text-lg font-medium">{label}</label>}
      <textarea
        name={name}
        placeholder={placeholder}
        className={clsx(
          "h-24 rounded-lg bg-black-100 p-4 font-inter placeholder:text-gray-200",
          className
        )}
        {...rest}
      />
    </div>
  );
};

export { FormTextarea };
