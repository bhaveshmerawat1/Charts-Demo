// src/utils/echarts/dataTransformers.ts

/**
 * Data transformation utilities for converting API responses
 * to chart-ready formats
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface TransformConfig {
  fieldMap: Record<string, string | ((item: any) => any)>;
  filters?: (item: any) => boolean;
  sort?: (a: any, b: any) => number;
}

export interface ScatterTransformConfig {
  xField: string | ((item: any) => number);
  yField: string | ((item: any) => number);
  nameField?: string | ((item: any) => string);
}

export interface TimeSeriesConfig {
  dateField: string | ((item: any) => Date | string);
  valueField: string | ((item: any) => number);
  nameField?: string | ((item: any) => string);
  dateFormat?: (date: Date | string) => string;
}

export interface NestedTransformConfig {
  dataPath: string | ((data: any) => any[]);
  fieldMap: Record<string, string | ((item: any) => any)>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get nested value from object using dot notation
 * @example getNestedValue({user: {profile: {age: 25}}}, "user.profile.age") => 25
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return undefined;
  }
  return value;
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * Normalize data to always return an array
 */
export function normalizeData(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Convert object to array of key-value pairs
    return Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }));
  }
  return [];
}

// ============================================================================
// Main Transformation Functions
// ============================================================================

/**
 * Generic transformer that maps API fields to chart fields
 * @example
 * transformToChartData(
 *   [{userId: 1, totalSales: 100}],
 *   {fieldMap: {name: 'userId', value: 'totalSales'}}
 * )
 */
export function transformToChartData<T>(
  data: T[],
  config: TransformConfig
): any[] {
  if (!Array.isArray(data)) {
    data = normalizeData(data) as T[];
  }

  let transformed = data.map((item) => {
    const result: any = {};
    for (const [targetKey, source] of Object.entries(config.fieldMap)) {
      if (typeof source === 'function') {
        result[targetKey] = source(item);
      } else {
        // Support dot notation
        result[targetKey] = getNestedValue(item, source);
      }
    }
    return result;
  });

  // Apply filters
  if (config.filters) {
    transformed = transformed.filter(config.filters);
  }

  // Apply sorting
  if (config.sort) {
    transformed = transformed.sort(config.sort);
  }

  return transformed;
}

/**
 * Transform data for scatter plots
 * Maps any two fields to x/y coordinates
 * @example
 * transformScatterData(
 *   [{revenue: 1000, orders: 50, channel: 'Direct'}],
 *   {xField: 'revenue', yField: 'orders', nameField: 'channel'}
 * )
 */
export function transformScatterData<T>(
  data: T[],
  config: ScatterTransformConfig
): any[] {
  if (!Array.isArray(data)) {
    data = normalizeData(data) as T[];
  }

  return data.map((item) => {
    const x = typeof config.xField === 'function'
      ? config.xField(item)
      : getNestedValue(item, config.xField);

    const y = typeof config.yField === 'function'
      ? config.yField(item)
      : getNestedValue(item, config.yField);

    const name = config.nameField
      ? (typeof config.nameField === 'function'
          ? config.nameField(item)
          : getNestedValue(item, config.nameField))
      : '';

    return { x, y, name };
  });
}

/**
 * Transform time-series data with date/timestamp handling
 * @example
 * transformTimeSeries(
 *   [{timestamp: '2024-01-01', sales: 100}],
 *   {dateField: 'timestamp', valueField: 'sales', dateFormat: (d) => new Date(d).toLocaleDateString()}
 * )
 */
export function transformTimeSeries<T>(
  data: T[],
  config: TimeSeriesConfig
): any[] {
  if (!Array.isArray(data)) {
    data = normalizeData(data) as T[];
  }

  const dateFormat = config.dateFormat || ((date: Date | string) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return String(date);
  });

  return data.map((item) => {
    const date = typeof config.dateField === 'function'
      ? config.dateField(item)
      : getNestedValue(item, config.dateField);

    const value = typeof config.valueField === 'function'
      ? config.valueField(item)
      : getNestedValue(item, config.valueField);

    const name = config.nameField
      ? (typeof config.nameField === 'function'
          ? config.nameField(item)
          : getNestedValue(item, config.nameField))
      : dateFormat(date);

    return {
      date: dateFormat(date),
      value,
      name,
      timestamp: date instanceof Date ? date.getTime() : date,
    };
  });
}

/**
 * Convert object key-value pairs to array format
 * @example
 * transformKeyValuePairs({Jan: 100, Feb: 200}) => [{name: 'Jan', value: 100}, {name: 'Feb', value: 200}]
 */
export function transformKeyValuePairs<T>(
  data: Record<string, T>
): Array<{ name: string; value: T }> {
  return Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
  }));
}

/**
 * Flatten nested object structures
 * @example
 * transformNestedData(
 *   {categories: [{id: 1, name: 'A', sales: 100}]},
 *   {dataPath: 'categories', fieldMap: {name: 'name', value: 'sales'}}
 * )
 */
export function transformNestedData<T>(
  data: T,
  config: NestedTransformConfig
): any[] {
  let sourceData: any[];
  
  if (typeof config.dataPath === 'function') {
    sourceData = config.dataPath(data);
  } else {
    sourceData = getNestedValue(data, config.dataPath) || [];
  }

  if (!Array.isArray(sourceData)) {
    sourceData = normalizeData(sourceData);
  }

  return sourceData.map((item) => {
    const result: any = {};
    for (const [targetKey, source] of Object.entries(config.fieldMap)) {
      if (typeof source === 'function') {
        result[targetKey] = source(item);
      } else {
        result[targetKey] = getNestedValue(item, source);
      }
    }
    return result;
  });
}

/**
 * Transform array of arrays (CSV-like format) to object array
 * @example
 * transformArrayFormat([['Jan', 100], ['Feb', 200]], ['month', 'value'])
 * => [{month: 'Jan', value: 100}, {month: 'Feb', value: 200}]
 */
export function transformArrayFormat(
  data: any[][],
  headers: string[]
): any[] {
  return data.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Transform data with computed/derived fields
 * @example
 * transformWithComputed(
 *   [{price: 10, quantity: 5}],
 *   {total: (item) => item.price * item.quantity}
 * )
 */
export function transformWithComputed<T>(
  data: T[],
  computedFields: Record<string, (item: T) => any>
): any[] {
  if (!Array.isArray(data)) {
    data = normalizeData(data) as T[];
  }

  return data.map((item) => {
    const result = { ...item } as any;
    for (const [fieldName, computeFn] of Object.entries(computedFields)) {
      result[fieldName] = computeFn(item);
    }
    return result;
  });
}

/**
 * Group and aggregate data
 * @example
 * groupAndAggregate(
 *   [{category: 'A', sales: 100}, {category: 'A', sales: 200}],
 *   {groupBy: 'category', aggregate: {total: (items) => items.reduce((sum, i) => sum + i.sales, 0)}}
 * )
 */
export function groupAndAggregate<T>(
  data: T[],
  config: {
    groupBy: string | ((item: T) => string);
    aggregate: Record<string, (items: T[]) => any>;
  }
): any[] {
  if (!Array.isArray(data)) {
    data = normalizeData(data) as T[];
  }

  const groups = new Map<string, T[]>();

  // Group items
  data.forEach((item) => {
    const key = typeof config.groupBy === 'function'
      ? config.groupBy(item)
      : getNestedValue(item, config.groupBy);
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  // Aggregate each group
  return Array.from(groups.entries()).map(([groupKey, items]) => {
    const result: any = { name: groupKey };
    for (const [fieldName, aggregateFn] of Object.entries(config.aggregate)) {
      result[fieldName] = aggregateFn(items);
    }
    return result;
  });
}

