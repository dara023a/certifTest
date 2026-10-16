export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  emptyLabel: string;
  ariaLabel: string;
}

export function BarChart({ data, emptyLabel, ariaLabel }: BarChartProps) {
  const max = Math.max(1, ...data.map((datum) => datum.value));
  const hasData = data.some((datum) => datum.value > 0);

  return (
    <div role="img" aria-label={ariaLabel}>
      {hasData ? (
        <div className="flex h-40 items-end gap-2">
          {data.map((datum) => (
            <div key={datum.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="mx-auto w-full max-w-10 rounded-t-md bg-primary/80 transition-[height]"
                  style={{ height: `${Math.max(4, (datum.value / max) * 100)}%` }}
                  title={`${datum.label}: ${datum.value}`}
                />
              </div>
              <span
                className="text-sm whitespace-nowrap text-muted-foreground tabular-nums"
              >
                {datum.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-40 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </div>
  );
}
