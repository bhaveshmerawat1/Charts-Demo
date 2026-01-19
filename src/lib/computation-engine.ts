/**
 * Enterprise Computation Engine
 * High-performance data processing utilities for enterprise-level calculations
 */

export interface AggregationConfig {
  groupBy: string | string[];
  aggregations: {
    [key: string]: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev';
  };
}

export interface TimeSeriesConfig {
  dateField: string;
  valueField: string;
  interval: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  fillMissing?: boolean;
}

/**
 * High-performance aggregation using Map for O(n) complexity
 */
export function aggregateData<T extends Record<string, any>>(
  data: T[],
  config: AggregationConfig
): any[] {
  const groupByFields = Array.isArray(config.groupBy)
    ? config.groupBy
    : [config.groupBy];

  const groups = new Map<string, T[]>();

  // Group data - O(n)
  for (const item of data) {
    const key = groupByFields
      .map((field) => String(item[field] ?? ''))
      .join('|');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  // Aggregate each group
  return Array.from(groups.entries()).map(([key, items]) => {
    const result: any = {};
    const keyParts = key.split('|');
    groupByFields.forEach((field, index) => {
      result[field] = keyParts[index];
    });

    for (const [field, operation] of Object.entries(config.aggregations)) {
      const values = items
        .map((item) => item[field])
        .filter((v) => v != null && !isNaN(v))
        .map(Number);

      switch (operation) {
        case 'sum':
          result[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[field] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
          break;
        case 'min':
          result[field] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          result[field] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case 'count':
          result[field] = items.length;
          break;
        case 'median':
          result[field] = calculateMedian(values);
          break;
        case 'stddev':
          result[field] = calculateStdDev(values);
          break;
      }
    }

    return result;
  });
}

/**
 * Calculate median efficiently
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

/**
 * Process time series data with interval grouping
 */
export function processTimeSeries<T extends Record<string, any>>(
  data: T[],
  config: TimeSeriesConfig
): any[] {
  const intervalMap: Record<string, (date: Date) => string> = {
    hour: (d) => d.toISOString().slice(0, 13) + ':00:00',
    day: (d) => d.toISOString().slice(0, 10),
    week: (d) => {
      const week = getWeekNumber(d);
      return `${d.getFullYear()}-W${week}`;
    },
    month: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    quarter: (d) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`,
    year: (d) => String(d.getFullYear()),
  };

  const getIntervalKey = intervalMap[config.interval];
  const grouped = new Map<string, { date: Date; values: number[] }>();

  for (const item of data) {
    const dateValue = item[config.dateField];
    if (!dateValue) continue;

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) continue;

    const intervalKey = getIntervalKey(date);
    const value = Number(item[config.valueField]);

    if (isNaN(value)) continue;

    if (!grouped.has(intervalKey)) {
      grouped.set(intervalKey, { date, values: [] });
    }
    grouped.get(intervalKey)!.values.push(value);
  }

  return Array.from(grouped.entries())
    .map(([interval, { date, values }]) => ({
      date: interval,
      timestamp: date.getTime(),
      value: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum: values.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Calculate growth rates and trends
 */
export function calculateGrowthRates(
  data: Array<{ date: string; value: number }>
): Array<{ date: string; value: number; growth: number; growthRate: number }> {
  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, growth: 0, growthRate: 0 };
    }

    const previous = data[index - 1];
    const growth = item.value - previous.value;
    const growthRate =
      previous.value !== 0 ? (growth / previous.value) * 100 : 0;

    return { ...item, growth, growthRate };
  });
}

/**
 * Calculate moving averages
 */
export function calculateMovingAverage(
  data: number[],
  window: number
): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Calculate percentiles
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Parallel processing for large datasets
 */
export async function processInParallel<T, R>(
  data: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 10
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...data];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;
          const result = await processor(item);
          results.push(result);
        }
      })()
    );
  }

  await Promise.all(workers);
  return results;
}

/**
 * Memory-efficient streaming aggregation for very large datasets
 */
export function* streamAggregate<T>(
  data: Generator<T> | T[],
  config: AggregationConfig
): Generator<any> {
  const groups = new Map<string, {
    count: number;
    sums: Record<string, number>;
    mins: Record<string, number>;
    maxs: Record<string, number>;
    values: Record<string, number[]>;
  }>();

  const groupByFields = Array.isArray(config.groupBy)
    ? config.groupBy
    : [config.groupBy];

  const dataIterator = Array.isArray(data) ? data[Symbol.iterator]() : data;

  for (const item of dataIterator) {
    const key = groupByFields
      .map((field) => String(item[field] ?? ''))
      .join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        count: 0,
        sums: {},
        mins: {},
        maxs: {},
        values: {},
      });
    }

    const group = groups.get(key)!;
    group.count++;

    for (const [field, operation] of Object.entries(config.aggregations)) {
      const value = Number(item[field]);
      if (isNaN(value)) continue;

      if (operation === 'sum' || operation === 'avg') {
        group.sums[field] = (group.sums[field] || 0) + value;
      }
      if (operation === 'min') {
        group.mins[field] = Math.min(group.mins[field] ?? Infinity, value);
      }
      if (operation === 'max') {
        group.maxs[field] = Math.max(group.maxs[field] ?? -Infinity, value);
      }
      if (operation === 'median' || operation === 'stddev') {
        if (!group.values[field]) {
          group.values[field] = [];
        }
        group.values[field].push(value);
      }
    }
  }

  // Yield results
  for (const [key, group] of groups.entries()) {
    const keyParts = key.split('|');
    const result: any = {};
    groupByFields.forEach((field, index) => {
      result[field] = keyParts[index];
    });

    for (const [field, operation] of Object.entries(config.aggregations)) {
      switch (operation) {
        case 'sum':
          result[field] = group.sums[field] || 0;
          break;
        case 'avg':
          result[field] = group.sums[field] / group.count || 0;
          break;
        case 'min':
          result[field] = group.mins[field] === Infinity ? 0 : group.mins[field];
          break;
        case 'max':
          result[field] = group.maxs[field] === -Infinity ? 0 : group.maxs[field];
          break;
        case 'count':
          result[field] = group.count;
          break;
        case 'median':
          result[field] = calculateMedian(group.values[field] || []);
          break;
        case 'stddev':
          result[field] = calculateStdDev(group.values[field] || []);
          break;
      }
    }

    yield result;
  }
}



