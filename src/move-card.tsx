import React from "react";

export interface MoveCardProps {
  children: React.ReactNode;
  className?: string;
  hasResource?: boolean;
  id: string;
  requirement?: string;
  resourceCount?: number;
  resourceName?: string;
  title: string;
}

export const MoveCard = ({
  id,
  children,
  className = "",
  hasResource = false,
  requirement,
  resourceCount = 0,
  resourceName = "",
  title,
}: MoveCardProps) => (
  <article className={`group break-inside-avoid ${className} py-4`}>
    <div className="flex items-start gap-3">
      <input
        aria-describedby={`${id}-title`}
        className="w-5 h-5 mt-0.5"
        id={id}
        type="checkbox"
        value={id}
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h3
            className="text-xl tracking-wide font-bold text-stone-800 dark:text-stone-100"
            id={`${id}-title`}
          >
            {title}
          </h3>
          {hasResource && (
            <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-sm">
              <span className="tracking-wider">{resourceName}</span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: resourceCount }).map((_, i) => (
                  <div
                    className="w-3 h-3 rounded-full border border-stone-400 dark:border-stone-600"
                    key={i}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {requirement && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            (Requires {requirement})
          </p>
        )}
        <div className="mt-2 text-stone-700 dark:text-stone-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </article>
);
