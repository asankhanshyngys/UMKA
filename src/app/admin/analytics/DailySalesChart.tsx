"use client";

import { useState } from "react";

type DailySale = {
  label: string;
  revenue: number;
};

type DailySalesChartProps = {
  dailySales: DailySale[];
  maxDailyRevenue: number;
};

const tengeFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function DailySalesChart({ dailySales, maxDailyRevenue }: DailySalesChartProps) {
  const [selectedDay, setSelectedDay] = useState<DailySale | null>(dailySales.at(-1) ?? null);
  const formatTenge = (value: number) => tengeFormatter.format(value);

  return (
    <>
      <div className="mt-8 overflow-x-auto pb-2" aria-label="График продаж по дням">
        <div className="flex h-52 min-w-max items-end gap-2">
          {dailySales.map((day) => {
            const isSelected = selectedDay?.label === day.label;
            const height = `${Math.max(day.revenue ? 4 : 0, (day.revenue / maxDailyRevenue) * 100)}%`;

            return (
              <button
                key={day.label}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${day.label}: ${formatTenge(day.revenue)} ₸`}
                onClick={() => setSelectedDay(day)}
                className="flex h-full w-11 shrink-0 items-end rounded-lg px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className={`w-full rounded-t transition-colors ${isSelected ? "bg-accent" : "bg-accent/70"}`} style={{ height }} />
              </button>
            );
          })}
        </div>
      </div>
      {selectedDay && <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-foreground">{selectedDay.label}: <span className="font-semibold">{formatTenge(selectedDay.revenue)} ₸</span></p>}
      <div className="mt-2 flex justify-between text-xs text-foreground-subtle"><span>{dailySales[0]?.label}</span><span>{dailySales.at(-1)?.label}</span></div>
    </>
  );
}
