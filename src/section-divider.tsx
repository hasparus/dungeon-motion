import { cn } from "./cn";

interface SectionDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SectionDivider = ({ className, ...rest }: SectionDividerProps) => (
  <div
    className={cn("flex items-center gap-4 my-12 print:my-6", className)}
    {...rest}
  >
    <div className="flex-1 border-t border-stone-400 dark:border-stone-600" />
    <div className="w-2 h-2 rotate-45 border border-stone-400 dark:border-stone-600" />
    <div className="flex-1 border-t border-stone-400 dark:border-stone-600" />
  </div>
);
