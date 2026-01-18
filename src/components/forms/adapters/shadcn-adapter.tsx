/**
 * shadcn/ui 组件适配器
 * 将 shadcn 组件适配为组件注册表所需的接口
 *
 * 如果你使用其他组件库，可以参考这个文件创建自己的适配器
 */
import type {
  ButtonProps,
  CardProps,
  CheckboxGroupProps,
  CheckboxProps,
  ComponentRegistry,
  DatePickerProps,
  ErrorMessageProps,
  FieldWrapperProps,
  HelperTextProps,
  LabelProps,
  RadioGroupProps,
  SelectProps,
  SwitchProps,
  TextInputProps,
  TextareaProps,
} from '@/types/component-registry';
import React from 'react';

import { Button as ShadcnButton } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from '@/components/ui/card';
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label as ShadcnLabel } from '@/components/ui/label';
import { RadioGroupItem, RadioGroup as ShadcnRadioGroup } from '@/components/ui/radio-group';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from '@/components/ui/select';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * 文本输入适配器
 */
const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  error,
  type = 'text',
  className,
}) => {
  return (
    <Input
      id={id}
      type={type}
      value={value ?? ''}
      onChange={(e) => {
        if (type === 'number') {
          const val = e.target.value;
          onChange(val === '' ? undefined : Number(val));
        } else {
          onChange(e.target.value);
        }
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(error && 'border-destructive', className)}
    />
  );
};

/**
 * 文本域适配器
 */
const Textarea: React.FC<TextareaProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  error,
  className,
}) => {
  return (
    <ShadcnTextarea
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(error && 'border-destructive', className)}
    />
  );
};

/**
 * 下拉选择适配器
 */
const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  options,
  error,
  className,
}) => {
  return (
    <ShadcnSelect
      value={value !== undefined && value !== null ? String(value) : undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn(error && 'border-destructive', className)}>
        <SelectValue placeholder={placeholder ?? '请选择...'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );
};

/**
 * 单选组适配器
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  value,
  onChange,
  disabled,
  options,
  className,
}) => {
  return (
    <ShadcnRadioGroup
      value={value !== undefined && value !== null ? String(value) : undefined}
      onValueChange={onChange}
      disabled={disabled}
      className={cn('flex flex-wrap gap-4', className)}
    >
      {options.map((option) => (
        <div key={String(option.value)} className="flex items-center space-x-2">
          <RadioGroupItem
            value={String(option.value)}
            id={`${id}-${option.value}`}
            disabled={option.disabled}
          />
          <ShadcnLabel htmlFor={`${id}-${option.value}`} className="cursor-pointer font-normal">
            {option.label}
          </ShadcnLabel>
        </div>
      ))}
    </ShadcnRadioGroup>
  );
};

/**
 * 单个复选框适配器
 */
const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  disabled,
  label,
  className,
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <ShadcnCheckbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
      {label && (
        <ShadcnLabel htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </ShadcnLabel>
      )}
    </div>
  );
};

/**
 * 复选框组适配器
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id,
  value,
  onChange,
  disabled,
  options,
  className,
}) => {
  const values = value ?? [];

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {options.map((option) => {
        const isChecked = values.includes(option.value);
        return (
          <div key={String(option.value)} className="flex items-center space-x-2">
            <ShadcnCheckbox
              id={`${id}-${option.value}`}
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...values, option.value]);
                } else {
                  onChange(values.filter((v) => v !== option.value));
                }
              }}
              disabled={disabled || option.disabled}
            />
            <ShadcnLabel htmlFor={`${id}-${option.value}`} className="cursor-pointer font-normal">
              {option.label}
            </ShadcnLabel>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 开关适配器
 */
const Switch: React.FC<SwitchProps> = ({ id, checked, onChange, disabled, label, className }) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <ShadcnSwitch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
      {label && (
        <ShadcnLabel htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </ShadcnLabel>
      )}
    </div>
  );
};

/**
 * 日期选择适配器
 */
const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  type = 'date',
  error,
  className,
}) => {
  return (
    <Input
      id={id}
      type={type === 'datetime' ? 'datetime-local' : 'date'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(error && 'border-destructive', className)}
    />
  );
};

/**
 * 标签适配器
 */
const Label: React.FC<LabelProps> = ({ htmlFor, required, children, className }) => {
  return (
    <ShadcnLabel
      htmlFor={htmlFor}
      className={cn(required && "after:ml-0.5 after:text-red-500 after:content-['*']", className)}
    >
      {children}
    </ShadcnLabel>
  );
};

/**
 * 按钮适配器
 */
const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled,
  onClick,
  children,
  className,
}) => {
  return (
    <ShadcnButton
      type={type}
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </ShadcnButton>
  );
};

/**
 * 卡片适配器
 */
const Card: React.FC<CardProps> = ({ title, description, children, footer, className }) => {
  return (
    <ShadcnCard className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? 'pt-6' : undefined}>{children}</CardContent>
      {footer && <CardFooter className="justify-end space-x-2">{footer}</CardFooter>}
    </ShadcnCard>
  );
};

/**
 * 字段包装器适配器
 */
const FieldWrapper: React.FC<FieldWrapperProps> = ({
  field,
  required,
  error,
  children,
  className,
}) => {
  const colSpan = field.layout?.colSpan ?? 12;

  return (
    <div
      className={cn('space-y-2', field.layout?.className, className)}
      style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
    >
      {/* 标签（checkbox 和 switch 自带标签，不需要单独渲染） */}
      {field.type !== 'checkbox' && field.type !== 'switch' && (
        <Label htmlFor={field.name} required={required}>
          {field.label}
        </Label>
      )}

      {/* 字段控件 */}
      {children}

      {/* 描述文本 */}
      {field.description && <HelperText text={field.description} />}

      {/* 错误信息 */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

/**
 * 错误信息适配器
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;
  return <p className={cn('text-sm text-destructive', className)}>{message}</p>;
};

/**
 * 帮助文本适配器
 */
const HelperText: React.FC<HelperTextProps> = ({ text, className }) => {
  if (!text) return null;
  return <p className={cn('text-sm text-muted-foreground', className)}>{text}</p>;
};

/**
 * shadcn/ui 组件注册表
 */
export const shadcnRegistry: ComponentRegistry = {
  TextInput,
  Textarea,
  Select,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Switch,
  DatePicker,
  Label,
  Button,
  Card,
  FieldWrapper,
  ErrorMessage,
  HelperText,
};

export default shadcnRegistry;
