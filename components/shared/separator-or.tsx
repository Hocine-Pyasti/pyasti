import { ReactNode } from "react";

const SeparatorWithOr = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="h-5 border-b my-5 text-center w-full">
      <span className="bg-gray-200 absolute left-1/2 -translate-x-1/2 mt-2 text-blue-500 px-2 rounded-md">
        {children ?? "or"}
      </span>
    </div>
  );
};

export default SeparatorWithOr;
