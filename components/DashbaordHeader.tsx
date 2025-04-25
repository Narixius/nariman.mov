import type { FC, PropsWithChildren } from "react";

export const DashboardHeader: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-row justify-between items-end text-white">
      {children}
    </div>
  );
};
