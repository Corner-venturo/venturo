/**
 * 工具函數 - 處理物件命名轉換
 */

/**
 * 將蛇形命名轉換為駝峰命名
 */
export function toCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const camelCaseObj: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        camelCaseObj[camelKey] = toCamelCase(value);
      } else if (Array.isArray(value)) {
        camelCaseObj[camelKey] = value.map(item =>
          item !== null && typeof item === 'object' ? toCamelCase(item) : item
        );
      } else {
        camelCaseObj[camelKey] = value;
      }
    }
  }

  return camelCaseObj as T;
}

/**
 * 將駝峰命名轉換為蛇形命名
 */
export function toSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item)) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const snakeCaseObj: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        snakeCaseObj[snakeKey] = toSnakeCase(value);
      } else if (Array.isArray(value)) {
        snakeCaseObj[snakeKey] = value.map(item =>
          item !== null && typeof item === 'object' ? toSnakeCase(item) : item
        );
      } else {
        snakeCaseObj[snakeKey] = value;
      }
    }
  }

  return snakeCaseObj as T;
}