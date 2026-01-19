// src/components/echarts/Chart.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, SeriesOption } from "echarts";
import clsx from "clsx";
import { exportToPDF, exportToCSV, exportToExcel, getChartDataAsTable, type ChartDataContext } from "./exportUtils";

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
    formats?: ("png" | "jpg" | "svg" | "pdf" | "csv" | "xlsx")[];
    fileName?: string;
    pixelRatio?: number;
    pdfOptions?: {
        pageSize?: "a4" | "letter";
        orientation?: "portrait" | "landscape";
        margin?: number;
    };
    csvOptions?: {
        includeHeaders?: boolean;
        delimiter?: string;
    };
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
    theme?: "light" | "dark";
    showLabels?: boolean;
    showLegend?: boolean;
    legendPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    legendOrientation?: "horizontal" | "vertical";
    legendConfig?: any;
    dataZoom?: boolean | {
        enabled?: boolean;
        type?: "slider" | "inside";
        start?: number;
        end?: number;
        height?: number;
        handleStyle?: any;
        dataBackground?: any;
        selectedDataBackground?: any;
        fillerColor?: string;
        borderColor?: string;
        handleIcon?: string;
        handleSize?: string | number;
    };
}

// Generate random colors for pie charts
function generateRandomColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        // Generate vibrant, distinct colors
        const hue = (i * 137.508) % 360; // Golden angle for better distribution
        const saturation = 60 + (i % 3) * 10; // 60-80%
        const lightness = 50 + (i % 2) * 10; // 50-60%
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
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
    theme = "light",
    showLabels,
    showLegend,
    legendPosition = "top-right",
    legendOrientation = "vertical",
    legendConfig,
    dataZoom,
}: ChartProps) {
    const chartRef = useRef<ReactECharts>(null);

    const [drillDownLevel, setDrillDownLevel] = useState<string[]>([]);
    const [currentData, setCurrentData] = useState(data);
    const [currentSeries, setCurrentSeries] = useState(series);
    const [currentXKey, setCurrentXKey] = useState(xKey);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

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

    // Generate random colors for pie charts if colors not provided
    const isPieChart = currentSeries.some((s) => ["pie", "funnel", "gauge"].includes(s.type));
    const finalColors = colors && colors.length > 0
        ? colors
        : isPieChart
            ? generateRandomColors(currentData.length)
            : colors;

    // Calculate theme colors early (needed for gauge charts)
    const isDark = theme === "dark";
    const textColor = isDark ? "#e5e7eb" : "#111827";
    const backgroundColor = isDark ? "#1f2937" : "#ffffff";
    const gridColor = isDark ? "#374151" : "#e5e7eb";
    const axisLabelColor = isDark ? "#9ca3af" : "#6b7280";

    const builtSeries: SeriesOption[] = currentSeries.map((s, index) => {
        const color = finalColors?.[index % (finalColors?.length || 1)];

        switch (s.type) {
            case "gauge":
                // Gauge charts need special handling - they use a single value, not array of name/value pairs
                const gaugeValue = currentData.length > 0
                    ? (s.valueAccessor?.(currentData[0]) || getValue(currentData[0], undefined, valueKey) || 0)
                    : 0;
                
                // Extract gauge-specific config from extra
                const {
                    min = 0,
                    max = 100,
                    detail = { formatter: "{value}" },
                    axisLine = {},
                    pointer = {},
                    splitLine = {},
                    axisTick = {},
                    axisLabel = {},
                    ...restGaugeExtra
                } = (s.extra as any) || {};
                
                return {
                    type: "gauge",
                    name: s.name,
                    radius: s.radius || "75%",
                    center: ["50%", "60%"],
                    min,
                    max,
                    splitNumber: 10,
                    data: [{ value: gaugeValue, name: s.name || "" }],
                    detail: {
                        ...detail,
                        offsetCenter: [0, "40%"],
                        fontSize: 20,
                        fontWeight: "bold",
                        color: textColor,
                    },
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: [[1, "#e5e7eb"]],
                            ...axisLine.lineStyle,
                        },
                        ...axisLine,
                    },
                    pointer: {
                        width: 5,
                        length: "60%",
                        ...pointer,
                    },
                    splitLine: {
                        length: 10,
                        lineStyle: {
                            color: gridColor,
                        },
                        ...splitLine,
                    },
                    axisTick: {
                        length: 8,
                        lineStyle: {
                            color: gridColor,
                        },
                        ...axisTick,
                    },
                    axisLabel: {
                        color: axisLabelColor,
                        fontSize: 12,
                        ...axisLabel,
                    },
                    ...restGaugeExtra,
                } as SeriesOption;

            case "pie":
            case "funnel":
                const isPieType = ["pie", "funnel"].includes(s.type);
                // Determine if labels should be shown
                // Priority: showLabels prop > extra.label.show > default (false)
                const shouldShowLabels = showLabels !== undefined 
                    ? showLabels 
                    : (s.extra as any)?.label?.show !== undefined 
                        ? (s.extra as any).label.show 
                        : false; // Default to false for pie charts
                
                // Build label configuration
                const labelConfig = shouldShowLabels
                    ? ((s.extra as any)?.label || { show: true })
                    : { show: false };
                
                // Build labelLine configuration
                const labelLineConfig = shouldShowLabels
                    ? ((s.extra as any)?.labelLine || { show: true })
                    : { show: false };
                
                // Extract extra props but exclude label and labelLine to avoid overriding our settings
                const { label: extraLabel, labelLine: extraLabelLine, ...restExtra } = (s.extra as any) || {};
                
                return {
                    type: s.type,
                    name: s.name,
                    radius: s.radius || ["40%", "70%"],
                    data: currentData.map((d, idx) => ({
                        name: s.nameAccessor?.(d) || getValue(d, undefined, nameKey) || "",
                        value: s.valueAccessor?.(d) || getValue(d, undefined, valueKey) || 0,
                    })),
                    label: labelConfig,
                    labelLine: labelLineConfig,
                    // Don't set itemStyle.color here - let ECharts use the color array from baseOption
                    ...restExtra,
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
                // Check if any data item has a color property for per-item coloring
                const hasItemColors = currentData.some((d) => d.color !== undefined);
                
                // Build data array as simple values
                const seriesData = currentData.map((d, idx) => {
                    if (s.dataAccessor) return s.dataAccessor(d, idx);
                    if (s.dataKey) return getValue(d, undefined, s.dataKey);
                    return d[s.dataKey!] || 0;
                });

                // For bar charts with per-item colors, use itemStyle.color as a function
                // that looks up the color from the original data item based on dataIndex
                let itemStyleConfig: any = undefined;
                if (s.type === "bar" && hasItemColors) {
                    itemStyleConfig = {
                        color: (params: any) => {
                            const dataIndex = params.dataIndex;
                            const originalItem = currentData[dataIndex];
                            return originalItem?.color || color || finalColors?.[index % (finalColors?.length || 1)];
                        }
                    };
                } else if (color) {
                    itemStyleConfig = { color };
                }

                return {
                    type: s.type,
                    name: s.name,
                    smooth: s.smooth ?? s.type === "line",
                    data: seriesData,
                    itemStyle: itemStyleConfig,
                    areaStyle: s.area ? { opacity: 0.25, color } : undefined,
                    stack: s.stack,
                    ...s.extra,
                } as SeriesOption;
        }
    });

    const baseOption: EChartsOption = {
        backgroundColor: backgroundColor,
        title:
            title && !showHeader
                ? {
                    text: title,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 500,
                        color: textColor
                    }
                }
                : undefined,

        color: finalColors,

        tooltip: {
            trigger: currentSeries.some((s) => ["pie", "funnel", "gauge"].includes(s.type)) ? "item" : "axis",
            axisPointer: { type: "cross" },
            backgroundColor: isDark ? "#374151" : "#ffffff",
            borderColor: isDark ? "#4b5563" : "#e5e7eb",
            textStyle: {
                color: textColor,
            },
        },

        grid: (() => {
            // Check if dataZoom should be enabled to adjust bottom margin
            const shouldEnableDataZoom = dataZoom === true || (typeof dataZoom === 'object' && dataZoom.enabled !== false);
            const hasXAxis = currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type)) && currentData.length > 0;
            const isTimeBased = currentXKey === "date" || currentXKey === "period";
            const needsSliderSpace = shouldEnableDataZoom && hasXAxis && isTimeBased;
            const sliderHeight = typeof dataZoom === 'object' && dataZoom.height ? dataZoom.height : 20;
            
            return {
                left: "3%",
                right: "4%",
                bottom: needsSliderSpace ? (sliderHeight + 30) + "px" : "3%",
                containLabel: true,
                borderColor: gridColor,
            };
        })(),

        xAxis:
            currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type)) && currentData.length
                ? {
                    type: currentSeries.some((s) => s.type === "scatter") ? "value" : "category",
                    data:
                        currentSeries.some((s) => s.type === "scatter")
                            ? undefined
                            : currentData.map((d) => getValue(d, undefined, currentXKey)),
                    axisLine: {
                        lineStyle: {
                            color: gridColor,
                        },
                    },
                    axisLabel: {
                        color: axisLabelColor,
                         interval: currentData.length <= 6 ? 0 : "auto",
                    },
                    splitLine: {
                        show: false,
                    },
                }
                : undefined,

        yAxis: currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type))
            ? {
                type: "value",
                axisLine: {
                    lineStyle: {
                        color: gridColor,
                    },
                },
                axisLabel: {
                    color: axisLabelColor,
                },
                splitLine: {
                    lineStyle: {
                        color: gridColor,
                        type: "dashed",
                    },
                },
            }
            : undefined,

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
                    axisName: {
                        color: axisLabelColor,
                    },
                    splitLine: {
                        lineStyle: {
                            color: gridColor,
                        },
                    },
                    splitArea: {
                        areaStyle: {
                            color: isDark ? ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"] : ["rgba(0, 0, 0, 0.05)", "rgba(0, 0, 0, 0.02)"],
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: gridColor,
                        },
                    },
                };
            })()
            : undefined,

        legend: (() => {
            const isPieChart = currentSeries.some((s) => ["pie", "funnel", "gauge"].includes(s.type));
            const shouldShowLegend = showLegend !== undefined 
                ? showLegend 
                : isPieChart; // Default to true for pie charts
            
            if (!shouldShowLegend) {
                return undefined;
            }

            // Calculate position based on legendPosition
            const positionConfig: any = {};
            switch (legendPosition) {
                case "top-right":
                    positionConfig.right = "5%";
                    positionConfig.top = "10%";
                    break;
                case "top-left":
                    positionConfig.left = "5%";
                    positionConfig.top = "10%";
                    break;
                case "bottom-right":
                    positionConfig.right = "5%";
                    positionConfig.bottom = "10%";
                    break;
                case "bottom-left":
                    positionConfig.left = "5%";
                    positionConfig.bottom = "10%";
                    break;
            }

            const baseLegendConfig = {
                show: true,
                orient: legendOrientation,
                ...positionConfig,
                textStyle: {
                    color: textColor,
                },
                itemGap: 10,
                itemWidth: 14,
                itemHeight: 14,
            };

            // Merge with custom legendConfig if provided
            return legendConfig 
                ? { ...baseLegendConfig, ...legendConfig }
                : baseLegendConfig;
        })(),

        dataZoom: (() => {
            // Check if dataZoom should be enabled
            const shouldEnableDataZoom = dataZoom === true || (typeof dataZoom === 'object' && dataZoom.enabled !== false);
            
            if (!shouldEnableDataZoom) {
                return undefined;
            }

            // Only enable for charts with xAxis (line, bar charts with time-based data)
            const hasXAxis = currentSeries.some((s) => ["line", "bar", "scatter"].includes(s.type)) && currentData.length > 0;
            if (!hasXAxis) {
                return undefined;
            }

            // Determine if this is a time-based chart (xKey is 'date' or 'period')
            const isTimeBased = currentXKey === "date" || currentXKey === "period";

            if (!isTimeBased) {
                return undefined;
            }

            // Parse dataZoom config
            const dataZoomConfig = typeof dataZoom === 'object' ? dataZoom : {};
            const sliderType = dataZoomConfig.type || 'slider';
            // Default to showing last 10% of data (most recent data)
            const start = dataZoomConfig.start !== undefined ? dataZoomConfig.start : 90;
            const end = dataZoomConfig.end !== undefined ? dataZoomConfig.end : 100;
            const sliderHeight = dataZoomConfig.height || 20;

            // Theme colors for dataZoom
            const handleColor = isDark ? "#60a5fa" : "#3b82f6";
            const borderColor = isDark ? "#4b5563" : "#9ca3af";
            const fillerColor = isDark ? "rgba(96, 165, 250, 0.2)" : "rgba(59, 130, 246, 0.2)";
            const dataBackgroundColor = isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.5)";
            const selectedDataBackgroundColor = isDark ? "rgba(96, 165, 250, 0.4)" : "rgba(59, 130, 246, 0.4)";
            const textStyleColor = isDark ? "#9ca3af" : "#6b7280";

            return [
                {
                    type: sliderType,
                    xAxisIndex: 0,
                    start,
                    end,
                    height: sliderHeight,
                    bottom: 10,
                    handleStyle: {
                        color: handleColor,
                        borderColor: borderColor,
                        ...dataZoomConfig.handleStyle,
                    },
                    dataBackground: {
                        areaStyle: {
                            color: dataBackgroundColor,
                        },
                        lineStyle: {
                            color: borderColor,
                            opacity: 0.3,
                        },
                        ...dataZoomConfig.dataBackground,
                    },
                    selectedDataBackground: {
                        areaStyle: {
                            color: selectedDataBackgroundColor,
                        },
                        lineStyle: {
                            color: handleColor,
                            opacity: 0.5,
                        },
                        ...dataZoomConfig.selectedDataBackground,
                    },
                    fillerColor: dataZoomConfig.fillerColor || fillerColor,
                    borderColor: dataZoomConfig.borderColor || borderColor,
                    handleIcon: dataZoomConfig.handleIcon || 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.1,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.6-0.4,1-1,1H26.8c-0.6,0-1-0.4-1-1V19.5c0-0.6,0.4-1,1-1h9.2c0.6,0,1,0.4,1,1V35.8z',
                    handleSize: dataZoomConfig.handleSize || '120%',
                    textStyle: {
                        color: textStyleColor,
                    },
                },
            ];
        })(),

        series: builtSeries,
    };

    // Export functionality
    const handleExport = async (format: "png" | "jpg" | "svg" | "pdf" | "csv" | "xlsx" = "png") => {
        const chartInstance = chartRef.current?.getEchartsInstance();
        if (!chartInstance) return;

        const fileName = exportOptions.fileName || title || "chart";
        const pixelRatio = exportOptions.pixelRatio || 2;

        // Handle image formats (png, jpg, svg)
        if (format === "png" || format === "jpg" || format === "svg") {
            // ECharts uses "jpeg" instead of "jpg"
            const echartsFormat = format === "jpg" ? "jpeg" : format;
            const url = chartInstance.getDataURL({
                type: echartsFormat as "png" | "jpeg" | "svg",
                pixelRatio,
                backgroundColor: isDark ? "#1f2937" : "#fff",
            });

            const link = document.createElement("a");
            link.download = `${fileName}.${format}`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Handle PDF export
        if (format === "pdf") {
            try {
                const chartImageUrl = chartInstance.getDataURL({
                    type: "png",
                    pixelRatio,
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                });

                const chartDataContext: ChartDataContext = {
                    data: currentData,
                    series: currentSeries,
                    xKey: currentXKey,
                    nameKey,
                    valueKey,
                    title,
                };

                const tableData = getChartDataAsTable(chartDataContext);
                await exportToPDF(chartImageUrl, tableData, fileName, title, exportOptions.pdfOptions);
            } catch (error) {
                console.error("Error exporting to PDF:", error);
            }
            return;
        }

        // Handle CSV export
        if (format === "csv") {
            const chartDataContext: ChartDataContext = {
                data: currentData,
                series: currentSeries,
                xKey: currentXKey,
                nameKey,
                valueKey,
                title,
            };

            const tableData = getChartDataAsTable(chartDataContext);
            exportToCSV(tableData, fileName);
            return;
        }

        // Handle Excel export
        if (format === "xlsx") {
            const chartDataContext: ChartDataContext = {
                data: currentData,
                series: currentSeries,
                xKey: currentXKey,
                nameKey,
                valueKey,
                title,
            };

            const tableData = getChartDataAsTable(chartDataContext);
            exportToExcel(tableData, fileName, title || "Chart Data");
            return;
        }
    };

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

    const mergedXAxis = baseOption.xAxis && overrideOption.xAxis
        ? (() => {
            const baseXAxis = Array.isArray(baseOption.xAxis) ? baseOption.xAxis[0] : baseOption.xAxis;
            const overrideXAxis = Array.isArray(overrideOption.xAxis) ? overrideOption.xAxis[0] : overrideOption.xAxis;
            const baseXAxisAny = baseXAxis as any;
            const overrideXAxisAny = overrideXAxis as any;
            const merged: any = {
                ...baseXAxis,
                ...overrideXAxis,
            };
            // Preserve data from base if not provided in override
            if (!overrideXAxisAny.data && baseXAxisAny.data) {
                merged.data = baseXAxisAny.data;
            }
            // Preserve type from base if not provided in override
            if (!overrideXAxisAny.type && baseXAxisAny.type) {  
                merged.type = baseXAxisAny.type;
            }
            return merged;
        })()
        : overrideOption.xAxis || baseOption.xAxis;

    const finalOption: EChartsOption = {
        ...baseOption,
        ...overrideOption,
        toolbox: overrideOption.toolbox,
        radar: mergedRadar,
        xAxis: mergedXAxis,
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
            ? isDark ? "bg-gray-800" : "bg-white"
            : cardVariant === "elevated"
                ? isDark ? "bg-gray-800 shadow-lg hover:shadow-xl" : "bg-white shadow-lg hover:shadow-xl"
                : cardVariant === "gradient"
                    ? isDark ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl" : "bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-xl"
                    : isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-slate-200";

    const headerClass = headerAlign === "center" ? "text-center" : "text-left";
    const titleColorClass = isDark ? "text-gray-100" : "text-gray-800";
    const subtitleColorClass = isDark ? "text-gray-400" : "text-gray-500";

    // Get enabled export formats
    const enabledFormats = exportOptions.formats || ["png", "jpg", "svg"];
    const formatLabels: Record<string, string> = {
        png: "PNG Image",
        jpg: "JPG Image",
        svg: "SVG Image",
        pdf: "PDF Document",
        csv: "CSV File",
        xlsx: "Excel File",
    };

    return (
        <div className={clsx(baseCard, variantClass, className)}>
            {showHeader && (title || subtitle) && (
                <div className={clsx("", headerClass)}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {title && <h3 className={clsx("text-lg font-sans font-medium", titleColorClass, titleClassName)}>{title}</h3>}
                            {subtitle && <p className={clsx("text-sm font-sans", subtitleColorClass, subtitleClassName)}>{subtitle}</p>}
                        </div>
                        {exportOptions.enabled && enabledFormats.length > 0 && (
                            <div className="relative ml-4">
                                <button
                                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                    aria-label="More options"
                                    className={clsx(
                                        "p-2 rounded-full transition-colors",
                                        isDark
                                            ? "text-gray-300 hover:bg-gray-700"
                                            : "text-gray-500 hover:bg-gray-200"
                                    )}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>

                                {exportDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setExportDropdownOpen(false)}
                                        />
                                        <div className={clsx(
                                            "absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 py-1",
                                            isDark
                                                ? "bg-gray-700 border border-gray-600"
                                                : "bg-white border border-gray-200"
                                        )}>
                                            {enabledFormats.map((format) => (
                                                <button
                                                    key={format}
                                                    onClick={() => {
                                                        handleExport(format as any);
                                                        setExportDropdownOpen(false);
                                                    }}
                                                    className={clsx(
                                                        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                                                        isDark
                                                            ? "text-gray-200 hover:bg-gray-600"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {format === "png" && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {format === "pdf" && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {(format === "csv" || format === "xlsx") && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                        </svg>
                                                    )}
                                                    {(format === "jpg" || format === "svg") && (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span>{formatLabels[format] || format.toUpperCase()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {enableDrillDown && drillDownLevel.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <button
                                onClick={() => handleBreadcrumbClick(-1)}
                                className={clsx(
                                    "font-medium",
                                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                                )}
                            >
                                All Categories
                            </button>

                            {drillDownLevel.map((level, index) => (
                                <React.Fragment key={index}>
                                    <span className={isDark ? "text-gray-500" : "text-gray-400"}>/</span>
                                    <button
                                        onClick={() => handleBreadcrumbClick(index)}
                                        className={clsx(
                                            "font-medium",
                                            isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                                        )}
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
                <ReactECharts 
                    ref={chartRef} 
                    option={finalOption} 
                    style={{ height: chartHeight, width: chartWidth, ...style }} 
                    onEvents={eventHandlers}
                    notMerge={false}
                    opts={{ renderer: 'canvas' }}
                />
            </div>
        </div>
    );
}
