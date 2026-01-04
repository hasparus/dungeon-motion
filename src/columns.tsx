import { cn } from "./cn";

interface ColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Columns = ({ children, className, ...rest }: ColumnsProps) => (
  <div
    className={cn(
      "md:columns-2 print:columns-2 print:gap-x-12 md:gap-x-12",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
