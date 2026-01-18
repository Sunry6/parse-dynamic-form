import type { FieldOption } from '@/types/dynamic-form';
import { useCallback, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

/**
 * sessionStorage 中 listMap 的数据结构
 * 支持两种格式：
 * 1. 简单列表：直接是选项数组
 * 2. 级联列表：根据父级值获取子列表
 */
export type ListMapValue =
  | FieldOption[] // 简单列表
  | Record<string, FieldOption[]>; // 级联列表 { parentValue: options[] }

export interface ListMap {
  [key: string]: ListMapValue;
}

/**
 * 从 sessionStorage 获取 listMap
 */
export function getListMap(): ListMap {
  if (typeof window === 'undefined') return {};
  try {
    const data = window.sessionStorage.getItem('listMap');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to parse listMap from sessionStorage:', error);
  }
  return {};
}

/**
 * 设置 listMap 到 sessionStorage（用于测试或初始化）
 */
export function setListMap(listMap: ListMap): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem('listMap', JSON.stringify(listMap));
}

/**
 * 获取指定 key 的选项列表
 * @param listKey - listMap 中的 key
 * @param parentValue - 父级字段的值（用于级联选择）
 */
export function getOptionsFromListMap(
  listKey: string,
  parentValue?: string | number
): FieldOption[] {
  const listMap = getListMap();
  const listData = listMap[listKey];

  if (!listData) {
    return [];
  }

  // 如果是简单数组，直接返回
  if (Array.isArray(listData)) {
    return listData;
  }

  // 如果是级联结构，根据 parentValue 获取
  if (parentValue !== undefined && parentValue !== null && parentValue !== '') {
    return listData[String(parentValue)] ?? [];
  }

  return [];
}

interface UseFieldOptionsParams {
  /** Schema 中定义的静态选项 */
  staticOptions?: FieldOption[];
  /** listMap 中的 key（如 'provinces', 'occupations'） */
  optionsKey?: string;
  /** 依赖的字段名列表（用于级联选择） */
  dependsOn?: string[];
  /** 远程 API 地址（可选，用于从接口获取） */
  optionsUrl?: string;
}

interface UseFieldOptionsReturn {
  options: FieldOption[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 字段选项加载 Hook
 *
 * 优先级：
 * 1. 如果有 optionsKey，从 sessionStorage 的 listMap 获取
 * 2. 如果有 optionsUrl，从远程 API 获取
 * 3. 否则使用 staticOptions
 *
 * @example
 * // 简单用法：从 listMap 获取职业列表
 * const { options } = useFieldOptions({ optionsKey: 'occupations' });
 *
 * @example
 * // 级联用法：根据省份获取城市列表
 * const { options } = useFieldOptions({
 *   optionsKey: 'cities',
 *   dependsOn: ['province'],
 * });
 */
export function useFieldOptions({
  staticOptions = [],
  optionsKey,
  dependsOn = [],
  optionsUrl,
}: UseFieldOptionsParams): UseFieldOptionsReturn {
  const [options, setOptions] = useState<FieldOption[]>(staticOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 监听依赖字段的值变化
  const watchedValues = useWatch({
    name: dependsOn,
    disabled: dependsOn.length === 0,
  });

  // 获取依赖字段的值（用于级联）
  const getParentValue = useCallback((): string | number | undefined => {
    if (dependsOn.length === 0) return undefined;

    // 如果只有一个依赖字段，直接返回其值
    if (dependsOn.length === 1) {
      const val = watchedValues as unknown;
      if (typeof val === 'string' || typeof val === 'number') {
        return val;
      }
      return undefined;
    }

    // 如果有多个依赖字段，返回第一个非空值
    if (Array.isArray(watchedValues)) {
      const found = watchedValues.find((v) => v !== undefined && v !== null && v !== '');
      if (typeof found === 'string' || typeof found === 'number') {
        return found;
      }
    }

    return undefined;
  }, [dependsOn, watchedValues]);

  // 从 listMap 加载选项
  const loadFromListMap = useCallback(() => {
    if (!optionsKey) return false;

    const parentValue = getParentValue();
    const loadedOptions = getOptionsFromListMap(optionsKey, parentValue);

    if (loadedOptions.length > 0) {
      setOptions(loadedOptions);
      setError(null);
      return true;
    }

    // 如果有依赖但父值为空，返回空数组
    if (dependsOn.length > 0 && (parentValue === undefined || parentValue === '')) {
      setOptions([]);
      return true;
    }

    return false;
  }, [optionsKey, dependsOn, getParentValue]);

  // 从远程 API 加载选项
  const loadFromApi = useCallback(async () => {
    if (!optionsUrl) return false;

    setIsLoading(true);
    setError(null);

    try {
      const parentValue = getParentValue();
      let url = optionsUrl;

      // 如果有依赖字段，将其值添加到 URL 参数
      if (dependsOn.length > 0 && parentValue !== undefined) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}parentValue=${encodeURIComponent(String(parentValue))}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 支持多种响应格式
      const loadedOptions = Array.isArray(data)
        ? data
        : data.data || data.options || data.list || [];

      setOptions(loadedOptions);
      return true;
    } catch (err) {
      console.error('Failed to load options from API:', err);
      setError(err instanceof Error ? err.message : '加载选项失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [optionsUrl, dependsOn, getParentValue]);

  // 刷新选项
  const refresh = useCallback(() => {
    // 优先从 listMap 加载
    if (loadFromListMap()) {
      return;
    }

    // 其次从 API 加载
    if (optionsUrl) {
      loadFromApi();
      return;
    }

    // 使用静态选项
    setOptions(staticOptions);
  }, [loadFromListMap, loadFromApi, optionsUrl, staticOptions]);

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    refresh();
  }, [refresh, watchedValues]);

  // 监听 sessionStorage 变化（其他页面可能更新了 listMap）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: globalThis.StorageEvent) => {
      if (event.key === 'listMap' && optionsKey) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [optionsKey, refresh]);

  return {
    options,
    isLoading,
    error,
    refresh,
  };
}

/**
 * 在表单外部使用的简化版 Hook（不依赖 react-hook-form）
 */
export function useFieldOptionsStandalone({
  optionsKey,
  parentValue,
  optionsUrl,
}: {
  optionsKey?: string;
  parentValue?: string | number;
  optionsUrl?: string;
}): UseFieldOptionsReturn {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (optionsKey) {
      const loadedOptions = getOptionsFromListMap(optionsKey, parentValue);
      setOptions(loadedOptions);
      return;
    }

    if (optionsUrl) {
      setIsLoading(true);
      fetch(optionsUrl)
        .then((res) => res.json())
        .then((data) => {
          const loadedOptions = Array.isArray(data)
            ? data
            : data.data || data.options || data.list || [];
          setOptions(loadedOptions);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [optionsKey, parentValue, optionsUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { options, isLoading, error, refresh };
}
