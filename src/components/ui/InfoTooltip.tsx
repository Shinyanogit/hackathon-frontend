"use client";

import React from "react";

type InfoTooltipProps = {
  className?: string;
  treeYearsText?: string;
  pointsText?: string;
};

const defaultLabel =
  "CO2削減量を木の吸収量に換算した、取引完了時に付与されるポイントです。";

export function InfoTooltip({ className, treeYearsText, pointsText }: InfoTooltipProps) {
  const label =
    treeYearsText || pointsText
      ? `このリユースで木が約 ${treeYearsText ?? "-"} 年で吸収するCO2相当を節約し、取引完了時${pointsText ?? ""} pt が付与されます。`
      : defaultLabel;
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div className="group inline-flex h-5 w-5 cursor-default items-center justify-center rounded-full border border-emerald-200 bg-white text-[10px] font-bold text-emerald-700 shadow-sm hover:bg-emerald-50">
        ?
        <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 shadow-lg group-hover:block">
          {label}
        </div>
      </div>
    </div>
  );
}
