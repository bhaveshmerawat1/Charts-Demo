// src/components/echarts/Chart.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, SeriesOption } from "echarts";
import clsx from "clsx";

export interface ChartSeries {
    type: "bar" | "line" | "pie" | "scatter" | "radar" | "funnel" | "gauge" | "heatmap";
    dataKey?: string;
    name?: string;
    smooth?: boolean;
    stack?: string;
    color?: string;
    area?: boolean;
    radius?: (string | number)[];
    extra?: SeriesOption;

    dataAccessor?: (item: any, index: number) => any;
    xAccessor?: (item: any) => any;
    yAccessor?: (item: any) => any;
    nameAccessor?: (item: any) => string;
    valueAccessor?: (item: any) => number;
}

export interface DrillDownData {
    name: string;
    data: any[];
    xKey?: string;
    series: ChartSeries[];
}

export interface ExportOptions {
    enabled?: boolean;
    showToolbox?: boolean;
    showCustomButtons?: boolean;
    formats?: ("png" | "jpg" | "svg")[];
    fileName?: string;
    pixelRatio?: number;
}

export interface ChartProps {
    data: any[];
    series: ChartSeries[];

    xKey?: string;
    nameKey?: string;
    valueKey?: string;

    title?: string;
    subtitle?: string;
    colors?: string[];
    overrideOption?: EChartsOption;

    height?: number | string;
    width?: number | string;
    className?: string;
    style?: React.CSSProperties;
    chartHeight?: number | string;
    chartWidth?: number | string;

    cardVariant?: "plain" | "elevated" | "gradient" | "bordered";
    headerAlign?: "left" | "center";
    showHeader?: boolean;
    bodyClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;

    onClick?: (params: any) => void;
    onHover?: (params: any) => void;

    drillDownData?: Record<string, DrillDownData>;
    enableDrillDown?: boolean;

    exportOptions?: ExportOptions;
}

export function Chart({
    title,
    subtitle,
    chartHeight = 350,
    chartWidth = "100%",
    data,
    xKey = "name",
    nameKey = "name",
    valueKey = "value",
    series,
    colors,
    overrideOption = {},
    onClick,
    onHover,
    style,
    className,
    cardVariant = "elevated",
    headerAlign = "left",
    showHeader = true,
    bodyClassName,
    titleClassName,
    subtitleClassName,
    drillDownData,
    enableDrillDown = false,
    exportOptions = { enabled: false },
}: ChartProps) {
    const chartRef = useRef<ReactECharts>(null);

    const [drillDownLevel, setDrillDownLevel] = useState<string[]>([]);
    const [currentData, setCurrentData] = useState(data);
    const [currentSeries, setCurrentSeries] = useState(series);
    const [currentXKey, setCurrentXKey] = useState(xKey);

    useEffect(() => {
        setCurrentData(data);
        setCurrentSeries(series);
        setCurrentXKey(xKey);
        setDrillDownLevel([]);
    }, [data, series, xKey]);

    const getValue = (item: any, accessor?: Function, key?: string, index?: number): any => {
        if (accessor) return accessor(item, index);
        if (key) {
            const keys = key.split(".");
            let value = item;
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
            return value;
        }
        return undefined;
    };

    const builtSeries: SeriesOption[] = currentSeries.map((s, index) => {
        const color = colors?.[index % (colors?.length || 1)];

        switch (s.type) {
            case "pie":
            case "funnel":
            case "gauge":
                return {
                    type: s.type,
                    name: s.name,
                    radius: s.radius || ["40%", "70%"],
                    data: currentData.map((d, idx) => ({
                        name: s.nameAccessor?.(d) || getValue(d, undefined, nameKey) || "",
                        value: s.valueAccessor?.(d) || getValue(d, undefined, valueKey) || 0,
                    })),
                    itemStyle: color ? { color } : undefined,
                    ...s.extra,
                } as SeriesOption;

            case "radar":
                return {
                    type: "radar",
                    name: s.name,
                    data: [
                        {
                            value: currentData.map((d, idx) => {
                                if (s.dataAccessor) return s.dataAccessor(d, idx);
                                if (s.dataKey) return getValue(d, undefined, s.dataKey);
                                return getValue(d, undefined, valueKey) || d[valueKey] || 0;
                            }),
                            name: s.name,
                        },
                    ],
                    areaStyle: (s.extra as any)?.areaStyle || { opacity: 0.3 },
                    ...s.extra,
                } as SeriesOption;

            case "scatter":
                return {
                    type: "scatter",
                    name: s.name,
                    data: currentData.map((d) => {
                        const x = s.xAccessor?.(d) ?? d.x ?? getValue(d, undefined, s.dataKey || "x") ?? 0;
                        const y = s.yAccessor?.(d) ?? d.y ?? getValue(d, undefined, "y") ?? d.value ?? 0;
                        return [x, y, d.name || ""];
                    }),
                    itemStyle: color ? { color } : undefined,
                    symbolSize: (s.extra as any)?.symbolSize || ((point: any) => (point[2] ? Math.sqrt(point[2]) / 5 : 8)),
                    ...s.extra,
                } as SeriesOption;

            default:
                return {
                    type: s.type,
                    name: s.name,
                    smooth: s.smooth ?? s.type === "line",
                    data: currentData.map((d, idx) => {
                        if (s.dataAccessor) return s.dataAccessor(d, idx);
                        if (s.dataKey) return getValue(d, undefined, s.dataKey);
                        return d[s.dataKey!] || 0;
                    }),
                    itemStyle: color ? { color } : undefined,
                    areaStyle: s.area ? { opacity: 0.25, color } : undefined,
                    stack: s.stack,
                    ...s.extra,
                } as SeriesOption;
        }
    });

    const baseOption: EChartsOption = {
        title:
            title && !showHeader
                ? { text: title, textStyle: { fontSize: 16, fontWeight: 500 } }
                : undefined,

        color: colors,

        tooltip: {
            trigger: currentSeries.some((s) => ["pie", "funnel", "gauge"].includes(s.type)) ? "item" : "axis",
            axisPointer: { type: "cross" },
        },

        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },

        xAxis:
            currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type)) && currentData.length
                ? {
                    type: currentSeries.some((s) => s.type === "scatter") ? "value" : "category",
                    data:
                        currentSeries.some((s) => s.type === "scatter")
                            ? undefined
                            : currentData.map((d) => getValue(d, undefined, currentXKey)),
                }
                : undefined,

        yAxis: currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type)) ? { type: "value" } : undefined,

        radar: currentSeries.some((s) => s.type === "radar")
            ? (() => {
                const maxValue = Math.max(
                    ...currentData.map((p) => getValue(p, undefined, valueKey) ?? p[valueKey] ?? 100)
                );

                const normalizedMax =
                    maxValue <= 10 ? 10 : maxValue <= 25 ? 25 : maxValue <= 50 ? 50 : maxValue <= 100 ? 100 : Math.ceil(maxValue / 25) * 25;

                return {
                    indicator: currentData.map((d) => ({
                        name: getValue(d, undefined, nameKey),
                        max: normalizedMax,
                    })),
                };
            })()
            : undefined,

        series: builtSeries,
    };

    // Export functionality
    const handleExport = (format: "png" | "jpg" | "svg" = "png") => {
        const chartInstance = chartRef.current?.getEchartsInstance();
        if (!chartInstance) return;

        const fileName = exportOptions.fileName || title || "chart";
        const pixelRatio = exportOptions.pixelRatio || 2;

        const url = chartInstance.getDataURL({
            type: format,
            pixelRatio,
            backgroundColor: "#fff",
        });

        const link = document.createElement("a");
        link.download = `${fileName}.${format}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Toolbox configuration for export
    const toolboxConfig = exportOptions.enabled && exportOptions.showToolbox
        ? {
            show: true,
            feature: {
                saveAsImage: {
                    show: true,
                    title: "Save as Image",
                    type: "png",
                    pixelRatio: exportOptions.pixelRatio || 2,
                    name: exportOptions.fileName || title || "chart",
                },
                dataView: {
                    show: true,
                    title: "Data View",
                    readOnly: false,
                },
                restore: {
                    show: true,
                    title: "Restore",
                }
            },
            right: 10,
            top: 10,
            iconStyle: {
                borderColor: "#666",
            },
            emphasis: {
                iconStyle: {
                    borderColor: "#333",
                },
            },
        }
        : undefined;

    const overrideSeriesArray = Array.isArray(overrideOption.series)
        ? overrideOption.series
        : overrideOption.series
            ? [overrideOption.series]
            : null;

    const mergedRadar = baseOption.radar && overrideOption.radar
        ? {
            ...baseOption.radar,
            ...((Array.isArray(overrideOption.radar) ? overrideOption.radar[0] : overrideOption.radar) as any),
            indicator: (baseOption.radar as any).indicator,
        }
        : overrideOption.radar || baseOption.radar;

    const finalOption: EChartsOption = {
        ...baseOption,
        ...overrideOption,
        // cast toolboxConfig to any so we don't get incompatible literal type errors
        toolbox: (toolboxConfig as any) || overrideOption.toolbox,
        radar: mergedRadar,
        series: overrideSeriesArray
            ? builtSeries.map((baseSeries, index) => {
                const overrideSeries = overrideSeriesArray[index];
                if (!overrideSeries) return baseSeries as SeriesOption;

                const merged: any = { ...baseSeries, ...overrideSeries };
                merged.type = baseSeries.type;
                merged.name = baseSeries.name;

                if (!overrideSeries.data || baseSeries.type === "radar") {
                    merged.data = (baseSeries as any).data;
                }

                return merged as SeriesOption;
            })
            : builtSeries,
    };

    const handleClick = (params: any) => {
        if (enableDrillDown && drillDownData && params.name) {
            const drillData = drillDownData[params.name];
            if (drillData) {
                setCurrentData(drillData.data);
                setCurrentSeries(drillData.series);
                setCurrentXKey(drillData.xKey || xKey);
                setDrillDownLevel([...drillDownLevel, params.name]);
                return;
            }
        }
        onClick?.(params);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setCurrentData(data);
            setCurrentSeries(series);
            setCurrentXKey(xKey);
            setDrillDownLevel([]);
            return;
        }

        const newLevel = drillDownLevel.slice(0, index + 1);

        let currentLevelData = data;
        let currentLevelSeries = series;
        let currentLevelXKey = xKey;

        for (const name of newLevel) {
            const drillData = drillDownData?.[name];
            if (drillData) {
                currentLevelData = drillData.data;
                currentLevelSeries = drillData.series;
                currentLevelXKey = drillData.xKey || xKey;
            }
        }

        setCurrentData(currentLevelData);
        setCurrentSeries(currentLevelSeries);
        setCurrentXKey(currentLevelXKey);
        setDrillDownLevel(newLevel);
    };

    const eventHandlers: Record<string, Function> = {
        click: handleClick,
        ...(onHover && { mouseover: onHover }),
    };

    const baseCard = "rounded-xl p-6 transition-shadow duration-200";
    const variantClass =
        cardVariant === "plain"
            ? "bg-white"
            : cardVariant === "elevated"
                ? "bg-white hover:shadow-xl"
                : cardVariant === "gradient"
                    ? "bg-gradient-to-br from-white to-slate-50 shadow-lg"
                    : "bg-white border border-slate-200 shadow-sm";

    const headerClass = headerAlign === "center" ? "text-center" : "text-left";

    return (
        <div className={clsx(baseCard, variantClass, className)}>
            {showHeader && (title || subtitle) && (
                <div className={clsx("mb-4", headerClass)}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {title && <h3 className={clsx("text-lg font-medium text-gray-800", titleClassName)}>{title}</h3>}
                            {subtitle && <p className={clsx("text-sm text-gray-500 mt-1", subtitleClassName)}>{subtitle}</p>}
                        </div>

                    </div>

                    {enableDrillDown && drillDownLevel.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <button onClick={() => handleBreadcrumbClick(-1)} className="text-blue-600 hover:text-blue-800 font-medium">
                                All Categories
                            </button>

                            {drillDownLevel.map((level, index) => (
                                <React.Fragment key={index}>
                                    <span className="text-gray-400">/</span>
                                    <button
                                        onClick={() => handleBreadcrumbClick(index)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {level}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={clsx("w-full", bodyClassName)}>
                <ReactECharts ref={chartRef} option={finalOption} style={{ height: chartHeight, width: chartWidth, ...style }} onEvents={eventHandlers} />
            </div>
        </div>
    );
}
