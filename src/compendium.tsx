import { cn } from "./cn";

export interface CompendiumMoveProps {
  children: React.ReactNode;
  title: string;
  trailing?: string;
}

export const CompendiumMove = ({
  children,
  title,
  trailing,
}: CompendiumMoveProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <h5 className="font-bold text-stone-800 dark:text-stone-100 tracking-wide">
        {title}
      </h5>
      {trailing && (
        <span className="text-xs text-stone-500 dark:text-stone-400 ml-auto">
          {trailing}
        </span>
      )}
    </div>
    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
      {children}
    </p>
  </div>
);

export interface CompendiumProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
}

export function Compendium({
  children,
  className,
  title,
  ...rest
}: CompendiumProps) {
  return (
    <section
      className={cn(
        "md:border border-stone-300 dark:border-stone-700 md:p-8 relative",
        className ?? ""
      )}
      {...rest}
    >
      <header className="md:absolute md:top-0 md:-translate-y-1/2 md:left-8 md:px-4 md:bg-stone-50 md:dark:bg-stone-900 md:border md:pb-1 md:pt-2.5 md:leading-none md:border-stone-300 md:dark:border-stone-700 max-md:pt-4">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-wide">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}
