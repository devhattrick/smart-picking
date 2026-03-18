import { max, scaleBand, scaleLinear } from 'd3';
import { useMemo, useState } from 'react';
import { useChartContainerSize } from './useChartContainerSize';

export interface GroupedBarChartDatum {
    name: string;
    sku: string;
    inbound: number;
    outbound: number;
}

export const movementSeries = [
    { key: 'inbound', label: 'นำเข้า (ชิ้น)', color: '#10B981' },
    { key: 'outbound', label: 'เบิกออก (ชิ้น)', color: '#F97316' },
] as const;

type MovementSeriesKey = (typeof movementSeries)[number]['key'];

interface ChartRow extends GroupedBarChartDatum {
    id: string;
    axisLabel: string;
}

interface BarTooltipState {
    x: number;
    y: number;
    name: string;
    sku: string;
    seriesLabel: string;
    value: number;
    color: string;
}

const numberFormatter = new Intl.NumberFormat('th-TH');

export default function D3GroupedBarChart({ data }: { data: GroupedBarChartDatum[] }) {
    const { ref, width, height } = useChartContainerSize<HTMLDivElement>();
    const [tooltip, setTooltip] = useState<BarTooltipState | null>(null);

    const rows = useMemo<ChartRow[]>(
        () => data.map((item, index) => ({
            ...item,
            id: `${item.sku || item.name}-${index}`,
            axisLabel: item.sku || item.name,
        })),
        [data],
    );

    const margin = { top: 12, right: 16, bottom: 46, left: 44 };
    const svgWidth = Math.max(width, rows.length * 84 + margin.left + margin.right);
    const svgHeight = height;
    const innerWidth = Math.max(svgWidth - margin.left - margin.right, 0);
    const innerHeight = Math.max(svgHeight - margin.top - margin.bottom, 0);

    const xScale = useMemo(
        () => scaleBand()
            .domain(rows.map((row) => row.id))
            .range([0, innerWidth])
            .paddingInner(0.2)
            .paddingOuter(0.08),
        [innerWidth, rows],
    );

    const groupScale = useMemo(
        () => scaleBand<MovementSeriesKey>()
            .domain(movementSeries.map((series) => series.key))
            .range([0, xScale.bandwidth()])
            .padding(0.14),
        [xScale],
    );

    const maxValue = useMemo(
        () => max(rows, (row) => Math.max(row.inbound, row.outbound)) ?? 0,
        [rows],
    );

    const yScale = useMemo(
        () => scaleLinear()
            .domain([0, Math.max(maxValue, 1)])
            .nice()
            .range([innerHeight, 0]),
        [innerHeight, maxValue],
    );

    const ticks = useMemo(
        () => yScale.ticks(innerHeight >= 220 ? 5 : 4),
        [innerHeight, yScale],
    );

    return (
        <div ref={ref} className="relative h-full w-full overflow-x-auto">
            {width > 0 && height > 0 ? (
                <>
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        role="img"
                        aria-label="กราฟแท่งเปรียบเทียบการนำเข้าและเบิกออกตาม SKU"
                    >
                        <g transform={`translate(${margin.left}, ${margin.top})`}>
                            {ticks.map((tick) => (
                                <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                                    <line x1={0} x2={innerWidth} stroke="#E2E8F0" strokeDasharray="3 3" />
                                    <text
                                        x={-10}
                                        y={0}
                                        fill="#64748B"
                                        fontSize="10"
                                        textAnchor="end"
                                        dominantBaseline="middle"
                                    >
                                        {numberFormatter.format(tick)}
                                    </text>
                                </g>
                            ))}

                            {rows.map((row) => {
                                const groupX = xScale(row.id);
                                if (groupX === undefined) return null;

                                return (
                                    <g key={row.id} transform={`translate(${groupX}, 0)`}>
                                        {movementSeries.map((series) => {
                                            const barX = groupScale(series.key);
                                            if (barX === undefined) return null;

                                            const value = row[series.key];
                                            const barY = yScale(value);
                                            const barHeight = innerHeight - barY;

                                            return (
                                                <rect
                                                    key={series.key}
                                                    x={barX}
                                                    y={barY}
                                                    width={groupScale.bandwidth()}
                                                    height={Math.max(barHeight, 0)}
                                                    rx={6}
                                                    fill={series.color}
                                                    className="transition-opacity duration-150 hover:opacity-90"
                                                    onMouseMove={(event) => {
                                                        const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                                        if (!bounds) return;

                                                        setTooltip({
                                                            x: event.clientX - bounds.left,
                                                            y: event.clientY - bounds.top,
                                                            name: row.name,
                                                            sku: row.sku,
                                                            seriesLabel: series.label,
                                                            value,
                                                            color: series.color,
                                                        });
                                                    }}
                                                    onMouseLeave={() => {
                                                        setTooltip(null);
                                                    }}
                                                />
                                            );
                                        })}

                                        <text
                                            x={xScale.bandwidth() / 2}
                                            y={innerHeight + 18}
                                            fill="#64748B"
                                            fontSize="10"
                                            textAnchor="middle"
                                        >
                                            {row.axisLabel.length > 12 ? `${row.axisLabel.slice(0, 11)}…` : row.axisLabel}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    {tooltip ? (
                        <div
                            className="pointer-events-none absolute z-10 rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-white shadow-lg"
                            style={{
                                left: Math.min(Math.max(tooltip.x + 12, 12), Math.max(width - 220, 12)),
                                top: Math.max(tooltip.y - 12, 12),
                                transform: 'translateY(-100%)',
                            }}
                        >
                            <div className="mb-1 font-medium text-white">
                                [{tooltip.sku}] {tooltip.name}
                            </div>
                            <div className="mb-1 flex items-center gap-2 text-slate-200">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: tooltip.color }}
                                />
                                <span>{tooltip.seriesLabel}</span>
                            </div>
                            <div className="text-slate-200">
                                {numberFormatter.format(tooltip.value)} ชิ้น
                            </div>
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
