/**
 * 原生 HTML 组件适配器
 * 展示如何用最简单的原生 HTML 元素实现组件注册表
 *
 * 这个示例可以帮助你理解如何为任何组件库创建适配器
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

/**
 * 原生文本输入
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
    <input
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
      className={className}
      style={{
        padding: '8px 12px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />
  );
};

/**
 * 原生文本域
 */
const Textarea: React.FC<TextareaProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  error,
  rows = 4,
  className,
}) => {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
      className={className}
      style={{
        padding: '8px 12px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
        resize: 'vertical',
      }}
    />
  );
};

/**
 * 原生下拉选择
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
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
      style={{
        padding: '8px 12px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'white',
      }}
    >
      <option value="" disabled>
        {placeholder ?? '请选择...'}
      </option>
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

/**
 * 原生单选组
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
    <div className={className} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {options.map((option) => (
        <label
          key={String(option.value)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <input
            type="radio"
            name={id}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={() => onChange(option.value)}
            disabled={disabled || option.disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

/**
 * 原生复选框
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
    <label
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  );
};

/**
 * 原生复选框组
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id: _id,
  value,
  onChange,
  disabled,
  options,
  className,
}) => {
  const values = value ?? [];

  return (
    <div className={className} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isChecked = values.includes(option.value);
        return (
          <label
            key={String(option.value)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...values, option.value]);
                } else {
                  onChange(values.filter((v) => v !== option.value));
                }
              }}
              disabled={disabled || option.disabled}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
};

/**
 * 原生开关（用 checkbox 模拟）
 */
const Switch: React.FC<SwitchProps> = ({
  id: _id,
  checked,
  onChange,
  disabled,
  label,
  className,
}) => {
  return (
    <label
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: checked ? '#3b82f6' : '#ccc',
          borderRadius: '12px',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            transition: 'left 0.2s',
          }}
        />
      </div>
      {label}
    </label>
  );
};

/**
 * 原生日期选择
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
    <input
      id={id}
      type={type === 'datetime' ? 'datetime-local' : 'date'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
      style={{
        padding: '8px 12px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />
  );
};

/**
 * 原生标签
 */
const Label: React.FC<LabelProps> = ({ htmlFor, required, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={className}
      style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}
    >
      {children}
      {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
    </label>
  );
};

/**
 * 原生按钮
 */
const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'default',
  disabled,
  onClick,
  children,
  className,
}) => {
  const getButtonStyles = () => {
    const base = {
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      border: 'none',
    };

    switch (variant) {
      case 'outline':
        return { ...base, backgroundColor: 'white', border: '1px solid #ccc', color: '#333' };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent', color: '#333' };
      case 'destructive':
        return { ...base, backgroundColor: '#ef4444', color: 'white' };
      default:
        return { ...base, backgroundColor: '#3b82f6', color: 'white' };
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={getButtonStyles()}
    >
      {children}
    </button>
  );
};

/**
 * 原生卡片
 */
const Card: React.FC<CardProps> = ({ title, description, children, footer, className }) => {
  return (
    <div
      className={className}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      {(title || description) && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          {title && <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>}
          {description && (
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>{description}</p>
          )}
        </div>
      )}
      <div style={{ padding: '16px' }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * 字段包装器
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
      className={className}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        marginBottom: '16px',
      }}
    >
      {field.type !== 'checkbox' && field.type !== 'switch' && (
        <Label htmlFor={field.name} required={required}>
          {field.label}
        </Label>
      )}
      {children}
      {field.description && <HelperText text={field.description} />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

/**
 * 错误信息
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <p className={className} style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
      {message}
    </p>
  );
};

/**
 * 帮助文本
 */
const HelperText: React.FC<HelperTextProps> = ({ text, className }) => {
  if (!text) return null;
  return (
    <p className={className} style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
      {text}
    </p>
  );
};

/**
 * 原生 HTML 组件注册表
 */
export const nativeRegistry: ComponentRegistry = {
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

export default nativeRegistry;
