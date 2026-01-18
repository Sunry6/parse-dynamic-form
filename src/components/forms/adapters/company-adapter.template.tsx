/**
 * 公司内部组件库适配器模板
 *
 * ============================================================
 * 使用说明：
 * 1. 复制此文件到你的项目中
 * 2. 将所有 'YourCompanyXxx' 替换为你公司组件库的实际组件
 * 3. 根据实际组件的 Props 调整适配逻辑
 * ============================================================
 *
 * 假设你的公司组件库导入方式如下：
 * import {
 *   Input as CompanyInput,
 *   Select as CompanySelect,
 *   Button as CompanyButton,
 *   // ...
 * } from '@company/ui-components';
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

// ============================================================
// 步骤 1: 导入你公司的组件
// ============================================================
// import {
//   Input as CompanyInput,
//   Textarea as CompanyTextarea,
//   Select as CompanySelect,
//   Radio as CompanyRadio,
//   Checkbox as CompanyCheckbox,
//   Switch as CompanySwitch,
//   DatePicker as CompanyDatePicker,
//   Button as CompanyButton,
//   Card as CompanyCard,
//   Form,
// } from '@company/ui-components';

// ============================================================
// 步骤 2: 创建适配器组件
// ============================================================

/**
 * 文本输入适配器
 *
 * 根据你公司 Input 组件的实际 Props 进行适配
 * 常见需要处理的差异：
 * - onChange 回调参数可能是 event 或直接是 value
 * - 错误状态的表示方式（error/status/validateStatus）
 * - 禁用状态的属性名（disabled/isDisabled）
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
}) => {
  // 示例：适配公司组件
  // return (
  //   <CompanyInput
  //     id={id}
  //     type={type}
  //     value={value}
  //     // 如果公司组件 onChange 直接返回 value
  //     onChange={onChange}
  //     // 或者如果返回 event
  //     // onChange={(e) => onChange(e.target.value)}
  //     onBlur={onBlur}
  //     disabled={disabled}
  //     placeholder={placeholder}
  //     // 公司组件可能用 status 表示状态
  //     status={error ? 'error' : undefined}
  //   />
  // );

  // 临时使用原生 input（请替换为你的公司组件）
  return (
    <input
      id={id}
      type={type}
      value={String(value ?? '')}
      onChange={(e) => {
        if (type === 'number') {
          onChange(e.target.value === '' ? undefined : Number(e.target.value));
        } else {
          onChange(e.target.value);
        }
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
      }}
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
}) => {
  // 示例：适配公司组件
  // return (
  //   <CompanyTextarea
  //     id={id}
  //     value={value}
  //     onChange={onChange}
  //     onBlur={onBlur}
  //     disabled={disabled}
  //     placeholder={placeholder}
  //     status={error ? 'error' : undefined}
  //   />
  // );

  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
        minHeight: '80px',
      }}
    />
  );
};

/**
 * 下拉选择适配器
 *
 * 需要注意的差异：
 * - options 结构可能不同（label/value vs text/key）
 * - onChange 返回值类型
 */
const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  options,
  error,
}) => {
  // 示例：适配公司组件
  // return (
  //   <CompanySelect
  //     id={id}
  //     value={value}
  //     onChange={onChange}
  //     disabled={disabled}
  //     placeholder={placeholder}
  //     // 如果公司组件 options 结构不同，需要转换
  //     options={options.map(opt => ({
  //       text: opt.label,
  //       key: opt.value,
  //       disabled: opt.disabled,
  //     }))}
  //     status={error ? 'error' : undefined}
  //   />
  // );

  return (
    <select
      id={id}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '8px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
      }}
    >
      <option value="" disabled>
        {placeholder ?? '请选择'}
      </option>
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * 单选组适配器
 */
const RadioGroup: React.FC<RadioGroupProps> = ({ id, value, onChange, disabled, options }) => {
  // 示例：适配公司组件
  // return (
  //   <CompanyRadio.Group
  //     name={id}
  //     value={value}
  //     onChange={onChange}
  //     disabled={disabled}
  //   >
  //     {options.map(opt => (
  //       <CompanyRadio key={opt.value} value={opt.value} disabled={opt.disabled}>
  //         {opt.label}
  //       </CompanyRadio>
  //     ))}
  //   </CompanyRadio.Group>
  // );

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <label
          key={String(opt.value)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <input
            type="radio"
            name={id}
            checked={String(value) === String(opt.value)}
            onChange={() => onChange(opt.value)}
            disabled={disabled || opt.disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

/**
 * 复选框适配器
 */
const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, disabled, label }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
 * 复选框组适配器
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id: _id,
  value,
  onChange,
  disabled,
  options,
}) => {
  const values = value ?? [];
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <label
          key={String(opt.value)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...values, opt.value]);
              } else {
                onChange(values.filter((v) => v !== opt.value));
              }
            }}
            disabled={disabled || opt.disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

/**
 * 开关适配器
 */
const Switch: React.FC<SwitchProps> = ({ id, checked, onChange, disabled, label }) => {
  // 示例：适配公司组件
  // return (
  //   <CompanySwitch
  //     id={id}
  //     checked={checked}
  //     onChange={onChange}
  //     disabled={disabled}
  //   >
  //     {label}
  //   </CompanySwitch>
  // );

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ width: '20px', height: '20px' }}
      />
      {label}
    </label>
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
}) => {
  // 示例：适配公司组件
  // return (
  //   <CompanyDatePicker
  //     id={id}
  //     value={value ? new Date(value) : undefined}
  //     onChange={(date) => onChange(date?.toISOString())}
  //     onBlur={onBlur}
  //     disabled={disabled}
  //     showTime={type === 'datetime'}
  //     status={error ? 'error' : undefined}
  //   />
  // );

  return (
    <input
      id={id}
      type={type === 'datetime' ? 'datetime-local' : 'date'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '8px',
        border: `1px solid ${error ? 'red' : '#ccc'}`,
        borderRadius: '4px',
      }}
    />
  );
};

/**
 * 标签适配器
 */
const Label: React.FC<LabelProps> = ({ htmlFor, required, children }) => {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
      {children}
      {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
    </label>
  );
};

/**
 * 按钮适配器
 */
const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'default',
  disabled,
  onClick,
  children,
}) => {
  // 示例：适配公司组件
  // return (
  //   <CompanyButton
  //     type={type}
  //     // 公司组件可能用 btnType/appearance 等属性
  //     btnType={variant === 'outline' ? 'secondary' : 'primary'}
  //     disabled={disabled}
  //     onClick={onClick}
  //   >
  //     {children}
  //   </CompanyButton>
  // );

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        border: variant === 'outline' ? '1px solid #ccc' : 'none',
        backgroundColor: variant === 'outline' ? 'white' : '#3b82f6',
        color: variant === 'outline' ? '#333' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
};

/**
 * 卡片适配器
 */
const Card: React.FC<CardProps> = ({ title, description, children, footer }) => {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      {(title || description) && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          {title && <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>}
          {description && <p style={{ margin: '4px 0 0', color: '#666' }}>{description}</p>}
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
 * 字段包装器适配器
 */
const FieldWrapper: React.FC<FieldWrapperProps> = ({ field, required, error, children }) => {
  const colSpan = field.layout?.colSpan ?? 12;
  return (
    <div style={{ gridColumn: `span ${colSpan} / span ${colSpan}`, marginBottom: '16px' }}>
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
 * 错误信息适配器
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{message}</p>;
};

/**
 * 帮助文本适配器
 */
const HelperText: React.FC<HelperTextProps> = ({ text }) => {
  if (!text) return null;
  return <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{text}</p>;
};

// ============================================================
// 步骤 3: 导出组件注册表
// ============================================================

/**
 * 公司内部组件注册表
 *
 * 使用方式：
 * import { companyRegistry } from './company-adapter';
 * <UniversalFormRenderer schema={schema} componentRegistry={companyRegistry} />
 */
export const companyRegistry: ComponentRegistry = {
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

export default companyRegistry;
