import type { FieldOption, FormFieldSchema } from '@/types/dynamic-form';
import type { ReactNode } from 'react';
import React from 'react';

/**
 * 基础输入组件的通用 Props
 */
export interface BaseInputProps {
  id: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

/**
 * 文本输入组件 Props
 */
export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value: string | number;
}

/**
 * 文本域组件 Props
 */
export interface TextareaProps extends BaseInputProps {
  value: string;
  rows?: number;
}

/**
 * 选择器组件 Props
 */
export interface SelectProps extends BaseInputProps {
  options: FieldOption[];
  value: string | number | undefined;
}

/**
 * 单选组组件 Props
 */
export interface RadioGroupProps extends BaseInputProps {
  options: FieldOption[];
  value: string | number | undefined;
}

/**
 * 复选框组件 Props（单个）
 */
export interface CheckboxProps {
  id: string;
  checked: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 复选框组组件 Props（多选）
 */
export interface CheckboxGroupProps {
  id: string;
  options: FieldOption[];
  value: (string | number | boolean)[];
  onChange: (value: (string | number | boolean)[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 开关组件 Props
 */
export interface SwitchProps {
  id: string;
  checked: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 日期选择器 Props
 */
export interface DatePickerProps extends BaseInputProps {
  value: string;
  type?: 'date' | 'datetime';
}

/**
 * 标签组件 Props
 */
export interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 按钮组件 Props
 */
export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * 卡片组件 Props
 */
export interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * 错误提示组件 Props
 */
export interface ErrorMessageProps {
  message?: string;
  className?: string;
}

/**
 * 帮助文本组件 Props
 */
export interface HelperTextProps {
  text?: string;
  className?: string;
}

/**
 * 字段包装器 Props
 */
export interface FieldWrapperProps {
  field: FormFieldSchema;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * 组件注册表类型
 * 定义了动态表单需要的所有 UI 组件
 */
export interface ComponentRegistry {
  // 输入组件
  TextInput: React.ComponentType<TextInputProps>;
  Textarea: React.ComponentType<TextareaProps>;
  Select: React.ComponentType<SelectProps>;
  RadioGroup: React.ComponentType<RadioGroupProps>;
  Checkbox: React.ComponentType<CheckboxProps>;
  CheckboxGroup: React.ComponentType<CheckboxGroupProps>;
  Switch: React.ComponentType<SwitchProps>;
  DatePicker: React.ComponentType<DatePickerProps>;

  // 布局组件
  Label: React.ComponentType<LabelProps>;
  Button: React.ComponentType<ButtonProps>;
  Card: React.ComponentType<CardProps>;
  FieldWrapper: React.ComponentType<FieldWrapperProps>;

  // 反馈组件
  ErrorMessage: React.ComponentType<ErrorMessageProps>;
  HelperText: React.ComponentType<HelperTextProps>;
}

/**
 * 部分组件注册表（允许只覆盖部分组件）
 */
export type PartialComponentRegistry = Partial<ComponentRegistry>;
