import React from "react";

import { CheckboxList } from "./checkbox-list";

export interface MoveCardProps {
  checkboxes?: number;
  children: React.ReactNode;
  className?: string;
  id: string;
  requirement?: string;
  resourceName?: string;
  resources?: number;
  title: string;
}

export const MoveCard = ({
  id,
  checkboxes,
  children,
  className = "",
  requirement,
  resourceName = "",
  resources,
  title,
}: MoveCardProps) => (
  <article className={`group break-inside-avoid ${className} py-4`}>
    <div className="flex-1">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          aria-describedby={`${id}-title`}
          className="size-4.5 shrink-0 aspect-square -mt-0.75"
          id={id}
          name={id}
          type="checkbox"
        />
        <h3
          className="text-xl tracking-wide font-bold text-stone-800 dark:text-stone-100  [text-box-trim:trim-end]"
          id={`${id}-title`}
        >
          {title}
        </h3>
        {!!resources && (
          <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-sm ml-auto">
            <span className="tracking-wider [text-box-trim:trim-end] translate-y-px">
              {resourceName}
            </span>
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: resources }).map((_, i) => (
                <div
                  className="size-4 rounded-full border border-stone-400 dark:border-stone-600"
                  key={i}
                />
              ))}
            </div>
          </div>
        )}
        {!!checkboxes && (
          <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-sm ml-auto">
            <div className="flex gap-0.75 ml-1">
              {Array.from({ length: checkboxes }).map((_, i) => (
                <input
                  className="size-3.5 aspect-square shrink-0"
                  key={i}
                  name={`${id}-${i}`}
                  type="checkbox"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {requirement && (
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.75">
          (Requires {requirement})
        </p>
      )}
      <div className="mt-2 text-stone-700 dark:text-stone-300 leading-relaxed">
        {children}
      </div>
    </div>
  </article>
);
