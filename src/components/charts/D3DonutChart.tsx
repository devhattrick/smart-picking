import { arc, pie } from 'd3';
import type { PieArcDatum } from 'd3';
import { useMemo, useState } from 'react';
import { useChartContainerSize } from './useChartContainerSize';

export interface DonutChartDatum {
    name: string;
    value: number;
    color: string;
}

interface DonutTooltipState {
    x: number;
    y: number;
    name: string;
    value: number;
    color: string;
}

const numberFormatter = new Intl.NumberFormat('th-TH');

export default function D3DonutChart({ data }: { data: DonutChartDatum[] }) {
    const { ref, width, height } = useChartContainerSize<HTMLDivElement>();
    const [tooltip, setTooltip] = useState<DonutTooltipState | null>(null);

    const total = useMemo(
        () => data.reduce((sum, item) => sum + item.value, 0),
        [data],
    );

    const pieData = useMemo(
        () => pie<DonutChartDatum>().sort(null).value((item) => item.value)(data),
        [data],
    );

    const outerRadius = Math.max(Math.min(width, height) / 2 - 18, 0);
    const innerRadius = outerRadius * 0.58;

    const arcGenerator = useMemo(
        () => arc<PieArcDatum<DonutChartDatum>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(8),
        [innerRadius, outerRadius],
    );

    const labelArc = useMemo(
        () => arc<PieArcDatum<DonutChartDatum>>()
            .innerRadius((innerRadius + outerRadius) / 2)
            .outerRadius((innerRadius + outerRadius) / 2),
        [innerRadius, outerRadius],
    );

    return (
        <div ref={ref} className="relative h-full w-full">
            {width > 0 && height > 0 ? (
                <>
                    <svg
                        width={width}
                        height={height}
                        viewBox={`0 0 ${width} ${height}`}
                        role="img"
                        aria-label="กราฟโดนัทสรุปการนำเข้าและเบิกออก"
                    >
                        <g transform={`translate(${width / 2}, ${height / 2})`}>
                            {pieData.map((segment) => {
                                const path = arcGenerator(segment);
                                if (!path) return null;

                                const [labelX, labelY] = labelArc.centroid(segment);
                                const percentage = total > 0
                                    ? Math.round((segment.data.value / total) * 100)
                                    : 0;

                                return (
                                    <g key={segment.data.name}>
                                        <path
                                            d={path}
                                            fill={segment.data.color}
                                            stroke="#FFFFFF"
                                            strokeWidth={2}
                                            className="transition-opacity duration-150 hover:opacity-90"
                                            onMouseMove={(event) => {
                                                const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                                if (!bounds) return;

                                                setTooltip({
                                                    x: event.clientX - bounds.left,
                                                    y: event.clientY - bounds.top,
                                                    name: segment.data.name,
                                                    value: segment.data.value,
                                                    color: segment.data.color,
                                                });
                                            }}
                                            onMouseLeave={() => {
                                                setTooltip(null);
                                            }}
                                        />
                                        {percentage >= 8 ? (
                                            <text
                                                x={labelX}
                                                y={labelY}
                                                fill="#FFFFFF"
                                                fontSize="11"
                                                fontWeight="600"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                {percentage}%
                                            </text>
                                        ) : null}
                                    </g>
                                );
                            })}

                            <text
                                y={-10}
                                fill="#64748B"
                                fontSize="12"
                                fontWeight="500"
                                textAnchor="middle"
                            >
                                รวมทั้งหมด
                            </text>
                            <text
                                y={16}
                                fill="#0F172A"
                                fontSize="22"
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {numberFormatter.format(total)}
                            </text>
                        </g>
                    </svg>

                    {tooltip ? (
                        <div
                            className="pointer-events-none absolute z-10 rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-white shadow-lg"
                            style={{
                                left: Math.min(Math.max(tooltip.x + 12, 12), Math.max(width - 140, 12)),
                                top: Math.max(tooltip.y - 16, 12),
                                transform: 'translateY(-100%)',
                            }}
                        >
                            <div className="mb-1 flex items-center gap-2 font-medium">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: tooltip.color }}
                                />
                                <span>{tooltip.name}</span>
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
