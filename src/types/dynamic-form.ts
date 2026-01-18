import React from 'react';
import { z } from 'zod';

/**
 * 表单字段类型
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'switch'
  | 'file'
  | 'group' // 字段组，用于嵌套
  | 'array'; // 数组字段，可动态增删

/**
 * 选项配置（用于 select, radio, checkbox 等）
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

/**
 * 字段依赖条件
 * 用于实现联动逻辑：当某个字段满足条件时，当前字段才显示/启用
 */
export interface FieldDependency {
  /** 依赖的字段名 */
  field: string;
  /** 条件类型 */
  condition:
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'greaterThan'
    | 'lessThan'
    | 'in'
    | 'notIn'
    | 'isEmpty'
    | 'isNotEmpty';
  /** 条件值 */
  value?: unknown;
  /** 满足条件时的行为 */
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

/**
 * 字段校验规则
 */
export interface FieldValidation {
  /** 是否必填 */
  required?: boolean | string;
  /** 最小长度 */
  minLength?: number | { value: number; message: string };
  /** 最大长度 */
  maxLength?: number | { value: number; message: string };
  /** 最小值（数字类型） */
  min?: number | { value: number; message: string };
  /** 最大值（数字类型） */
  max?: number | { value: number; message: string };
  /** 正则表达式 */
  pattern?: string | { value: string; message: string };
  /** 自定义校验函数名（需在 validatorRegistry 中注册） */
  custom?: string;
  /** 邮箱格式 */
  email?: boolean | string;
  /** URL 格式 */
  url?: boolean | string;
}

/**
 * 表单字段 Schema 定义
 */
export interface FormFieldSchema {
  /** 字段名（唯一标识） */
  name: string;
  /** 字段类型 */
  type: FieldType;
  /** 显示标签 */
  label: string;
  /** 占位符 */
  placeholder?: string;
  /** 默认值 */
  defaultValue?: unknown;
  /** 字段描述/帮助文本 */
  description?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 选项列表（用于 select, radio, checkbox） */
  options?: FieldOption[];
  /** listMap 中的 key（从 sessionStorage 获取选项） */
  optionsKey?: string;
  /** 远程获取选项的 API 地址 */
  optionsUrl?: string;
  /** 选项依赖（当依赖字段变化时重新获取选项） */
  optionsDependsOn?: string[];
  /** 校验规则 */
  validation?: FieldValidation;
  /** 联动依赖 */
  dependencies?: FieldDependency[];
  /** 子字段（用于 group 和 array 类型） */
  children?: FormFieldSchema[];
  /** 数组字段的最小项数 */
  minItems?: number;
  /** 数组字段的最大项数 */
  maxItems?: number;
  /** 布局相关 */
  layout?: {
    /** 列宽（1-12，基于 12 列栅格） */
    colSpan?: number;
    /** 自定义 className */
    className?: string;
  };
  /** 额外属性 */
  props?: Record<string, unknown>;
}

/**
 * 表单 Schema 定义
 */
export interface FormSchema {
  /** Schema 唯一标识 */
  id: string;
  /** Schema 版本 */
  version?: string;
  /** 表单标题 */
  title?: string;
  /** 表单描述 */
  description?: string;
  /** 字段列表 */
  fields: FormFieldSchema[];
  /** 表单级别的布局配置 */
  layout?: {
    /** 列数 */
    columns?: number;
    /** 标签位置 */
    labelPosition?: 'top' | 'left' | 'right';
    /** 标签宽度 */
    labelWidth?: string;
  };
  /** 表单提交配置 */
  submit?: {
    /** 提交按钮文本 */
    text?: string;
    /** 提交 API 地址 */
    url?: string;
    /** 提交方法 */
    method?: 'POST' | 'PUT' | 'PATCH';
  };
}

/**
 * 表单字段状态
 */
export interface FieldState {
  visible: boolean;
  disabled: boolean;
  required: boolean;
}

/**
 * 动态表单 Props
 */
export interface DynamicFormProps {
  /** 表单 Schema */
  schema: FormSchema;
  /** 初始值 */
  defaultValues?: Record<string, unknown>;
  /** 提交回调 */
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  /** 值变化回调 */
  onChange?: (data: Record<string, unknown>) => void;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义校验器注册表 */
  validators?: Record<
    string,
    (value: unknown, formValues: Record<string, unknown>) => boolean | string
  >;
  /** 自定义渲染器注册表 */
  renderers?: Record<string, React.ComponentType<FieldRendererProps>>;
}

/**
 * 字段渲染器 Props
 */
export interface FieldRendererProps {
  field: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
}

/**
 * Schema 解析结果
 */
export interface ParsedSchema {
  fields: FormFieldSchema[];
  zodSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultValues: Record<string, unknown>;
}
