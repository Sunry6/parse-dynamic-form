import type { FieldDependency, FieldState, FormFieldSchema } from '@/types/dynamic-form';
import { useCallback, useMemo } from 'react';

/**
 * 检查单个依赖条件是否满足
 */
function checkCondition(dependency: FieldDependency, fieldValue: unknown): boolean {
  const { condition, value } = dependency;

  switch (condition) {
    case 'equals':
      return fieldValue === value;

    case 'notEquals':
      return fieldValue !== value;

    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.includes(value);
      }
      return false;

    case 'greaterThan':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;

    case 'lessThan':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;

    case 'in':
      if (Array.isArray(value)) {
        return value.includes(fieldValue);
      }
      return false;

    case 'notIn':
      if (Array.isArray(value)) {
        return !value.includes(fieldValue);
      }
      return true;

    case 'isEmpty':
      return (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case 'isNotEmpty':
      return !(
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    default:
      return true;
  }
}

/**
 * 计算字段状态（根据联动依赖）
 */
export function computeFieldState(
  field: FormFieldSchema,
  formValues: Record<string, unknown>
): FieldState {
  const state: FieldState = {
    visible: !field.hidden,
    disabled: field.disabled ?? false,
    required: field.validation?.required ? true : false,
  };

  // 如果没有依赖配置，返回默认状态
  if (!field.dependencies || field.dependencies.length === 0) {
    return state;
  }

  // 处理每个依赖条件
  for (const dependency of field.dependencies) {
    const dependentValue = getNestedValue(formValues, dependency.field);
    const conditionMet = checkCondition(dependency, dependentValue);

    if (conditionMet) {
      switch (dependency.action) {
        case 'show':
          state.visible = true;
          break;
        case 'hide':
          state.visible = false;
          break;
        case 'enable':
          state.disabled = false;
          break;
        case 'disable':
          state.disabled = true;
          break;
        case 'require':
          state.required = true;
          break;
        case 'optional':
          state.required = false;
          break;
      }
    } else {
      // 条件不满足时的反向处理
      switch (dependency.action) {
        case 'show':
          state.visible = false;
          break;
        case 'hide':
          state.visible = true;
          break;
        case 'enable':
          state.disabled = true;
          break;
        case 'disable':
          state.disabled = false;
          break;
        // require 和 optional 不做反向处理
      }
    }
  }

  return state;
}

/**
 * 获取嵌套对象的值
 * 支持点号分隔的路径，如 'user.address.city'
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * 设置嵌套对象的值
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    } else {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * 自定义 Hook：管理字段联动状态
 */
export function useFieldDependencies(
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>
) {
  // 计算所有字段的状态
  const fieldStates = useMemo(() => {
    const states: Record<string, FieldState> = {};

    const processFields = (fieldList: FormFieldSchema[], prefix = '') => {
      fieldList.forEach((field) => {
        const fieldPath = prefix ? `${prefix}.${field.name}` : field.name;
        states[fieldPath] = computeFieldState(field, formValues);

        // 递归处理子字段
        if (field.children) {
          processFields(field.children, fieldPath);
        }
      });
    };

    processFields(fields);
    return states;
  }, [fields, formValues]);

  // 获取单个字段的状态
  const getFieldState = useCallback(
    (fieldName: string): FieldState => {
      return (
        fieldStates[fieldName] ?? {
          visible: true,
          disabled: false,
          required: false,
        }
      );
    },
    [fieldStates]
  );

  // 检查字段是否应该显示
  const isFieldVisible = useCallback(
    (fieldName: string): boolean => {
      return getFieldState(fieldName).visible;
    },
    [getFieldState]
  );

  // 检查字段是否禁用
  const isFieldDisabled = useCallback(
    (fieldName: string): boolean => {
      return getFieldState(fieldName).disabled;
    },
    [getFieldState]
  );

  // 检查字段是否必填
  const isFieldRequired = useCallback(
    (fieldName: string): boolean => {
      return getFieldState(fieldName).required;
    },
    [getFieldState]
  );

  return {
    fieldStates,
    getFieldState,
    isFieldVisible,
    isFieldDisabled,
    isFieldRequired,
  };
}
