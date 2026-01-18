import type { FieldState, FormFieldSchema } from '@/types/dynamic-form';
import { Controller, useFormContext } from 'react-hook-form';
import { useComponentRegistry } from './ComponentRegistry';

interface UniversalFieldProps {
  field: FormFieldSchema;
  fieldState: FieldState;
  readonly?: boolean;
}

/**
 * 通用字段渲染组件
 * 使用组件注册表渲染，与具体组件库无关
 */
export function UniversalField({ field, fieldState, readonly }: UniversalFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const registry = useComponentRegistry();

  // 如果字段不可见，不渲染
  if (!fieldState.visible) {
    return null;
  }

  const isDisabled = fieldState.disabled || readonly;
  const isRequired = fieldState.required;
  const error = errors[field.name];
  const errorMessage = error?.message as string | undefined;

  const { FieldWrapper } = registry;

  return (
    <FieldWrapper field={field} required={isRequired} error={errorMessage}>
      <Controller
        name={field.name}
        control={control}
        render={({ field: formField }) => (
          <FieldControl
            schema={field}
            value={formField.value}
            onChange={formField.onChange}
            onBlur={formField.onBlur}
            disabled={isDisabled}
            error={!!error}
          />
        )}
      />
    </FieldWrapper>
  );
}

interface FieldControlProps {
  schema: FormFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: boolean;
}

/**
 * 根据字段类型选择并渲染对应的组件
 */
function FieldControl({ schema, value, onChange, onBlur, disabled, error }: FieldControlProps) {
  const registry = useComponentRegistry();
  const { type, name, placeholder, options = [] } = schema;

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <registry.TextInput
          id={name}
          type={type}
          value={(value as string) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
        />
      );

    case 'number':
      return (
        <registry.TextInput
          id={name}
          type="number"
          value={value as number}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
        />
      );

    case 'textarea':
      return (
        <registry.Textarea
          id={name}
          value={(value as string) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
        />
      );

    case 'select':
      return (
        <registry.Select
          id={name}
          value={value as string | number | undefined}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          disabled={disabled}
          error={error}
        />
      );

    case 'radio':
      return (
        <registry.RadioGroup
          id={name}
          value={value as string | number | undefined}
          onChange={onChange}
          options={options}
          disabled={disabled}
        />
      );

    case 'checkbox':
      // 单个 checkbox 或多选
      if (options.length <= 1) {
        return (
          <registry.Checkbox
            id={name}
            checked={!!value}
            onChange={onChange}
            label={schema.label}
            disabled={disabled}
          />
        );
      }
      return (
        <registry.CheckboxGroup
          id={name}
          value={(value as (string | number | boolean)[]) ?? []}
          onChange={onChange}
          options={options}
          disabled={disabled}
        />
      );

    case 'switch':
      return (
        <registry.Switch
          id={name}
          checked={!!value}
          onChange={onChange}
          label={schema.label}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <registry.DatePicker
          id={name}
          type="date"
          value={(value as string) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      );

    case 'datetime':
      return (
        <registry.DatePicker
          id={name}
          type="datetime"
          value={(value as string) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      );

    default:
      return (
        <registry.TextInput
          id={name}
          value={(value as string) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
        />
      );
  }
}
