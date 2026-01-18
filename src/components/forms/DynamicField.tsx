import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useFieldOptions } from '@/hooks/useFieldOptions';
import { cn } from '@/lib/utils';
import type { FieldOption, FieldState, FormFieldSchema } from '@/types/dynamic-form';
import { Controller, useFormContext } from 'react-hook-form';

interface DynamicFieldProps {
  field: FormFieldSchema;
  fieldState: FieldState;
  readonly?: boolean;
}

/**
 * 动态字段渲染组件
 * 根据字段类型渲染对应的表单控件
 */
export function DynamicField({ field, fieldState, readonly }: DynamicFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // 如果字段不可见，不渲染
  if (!fieldState.visible) {
    return null;
  }

  const isDisabled = fieldState.disabled || readonly;
  const isRequired = fieldState.required;
  const error = errors[field.name];
  const errorMessage = error?.message as string | undefined;

  const colSpan = field.layout?.colSpan ?? 12;

  return (
    <div
      className={cn('space-y-2', field.layout?.className, `col-span-${colSpan}`)}
      style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
    >
      {/* 标签 */}
      {field.type !== 'checkbox' && field.type !== 'switch' && (
        <Label
          htmlFor={field.name}
          className={cn(isRequired && "after:ml-0.5 after:text-red-500 after:content-['*']")}
        >
          {field.label}
        </Label>
      )}

      {/* 字段控件 */}
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

      {/* 描述文本 */}
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}

      {/* 错误信息 */}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
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
 * 根据字段类型渲染具体的控件
 */
function FieldControl({ schema, value, onChange, onBlur, disabled, error }: FieldControlProps) {
  const { type, name, placeholder, options: staticOptions = [] } = schema;

  // 使用 useFieldOptions hook 加载选项（从 listMap 或 API）
  const { options: loadedOptions, isLoading } = useFieldOptions({
    staticOptions,
    optionsKey: schema.optionsKey,
    optionsUrl: schema.optionsUrl,
    dependsOn: schema.optionsDependsOn,
  });

  // 最终使用的选项：优先使用加载的选项，否则使用静态选项
  const options: FieldOption[] =
    schema.optionsKey || schema.optionsUrl ? loadedOptions : staticOptions;

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <Input
          id={name}
          type={type}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'number':
      return (
        <Input
          id={name}
          type="number"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === '' ? undefined : Number(val));
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'textarea':
      return (
        <Textarea
          id={name}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'select':
      return (
        <Select
          value={value !== undefined && value !== null ? String(value) : undefined}
          onValueChange={onChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger id={name} className={cn(error && 'border-destructive')}>
            <SelectValue placeholder={isLoading ? '加载中...' : (placeholder ?? '请选择...')} />
          </SelectTrigger>
          <SelectContent>
            {options.length === 0 && !isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">暂无选项</div>
            ) : (
              options.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );

    case 'radio':
      if (isLoading) {
        return <div className="text-sm text-muted-foreground">加载中...</div>;
      }
      return (
        <RadioGroup
          value={value !== undefined && value !== null ? String(value) : undefined}
          onValueChange={onChange}
          disabled={disabled}
          className="flex flex-wrap gap-4"
        >
          {options.map((option) => (
            <div key={String(option.value)} className="flex items-center space-x-2">
              <RadioGroupItem
                value={String(option.value)}
                id={`${name}-${option.value}`}
                disabled={option.disabled}
              />
              <Label htmlFor={`${name}-${option.value}`} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'checkbox':
      // 单个 checkbox 或多选
      if (options.length <= 1) {
        // 单个 checkbox
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={name} checked={!!value} onCheckedChange={onChange} disabled={disabled} />
            <Label htmlFor={name} className="cursor-pointer font-normal">
              {schema.label}
            </Label>
          </div>
        );
      }
      // 多选 checkbox
      if (isLoading) {
        return <div className="text-sm text-muted-foreground">加载中...</div>;
      }
      return (
        <div className="flex flex-wrap gap-4">
          {options.map((option) => {
            const values = (value as (string | number | boolean)[]) ?? [];
            const isChecked = values.includes(option.value);
            return (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <Checkbox
                  id={`${name}-${option.value}`}
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
                <Label htmlFor={`${name}-${option.value}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch id={name} checked={!!value} onCheckedChange={onChange} disabled={disabled} />
          <Label htmlFor={name} className="cursor-pointer font-normal">
            {schema.label}
          </Label>
        </div>
      );

    case 'date':
      return (
        <Input
          id={name}
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'datetime':
      return (
        <Input
          id={name}
          type="datetime-local"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    default:
      return (
        <Input
          id={name}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
        />
      );
  }
}
