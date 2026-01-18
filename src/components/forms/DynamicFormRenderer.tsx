import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFieldDependencies } from '@/lib/field-dependencies';
import { mergeDefaultValues, parseFormSchema } from '@/lib/schema-parser';
import { cn } from '@/lib/utils';
import type { DynamicFormProps, FormFieldSchema } from '@/types/dynamic-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ArrayField } from './ArrayField';
import { DynamicField } from './DynamicField';

/**
 * 动态表单渲染器
 * 根据 Schema 动态渲染表单，支持联动和校验
 */
export function DynamicFormRenderer({
  schema,
  defaultValues: userDefaultValues,
  onSubmit,
  onChange,
  readonly,
  loading,
  className,
}: DynamicFormProps) {
  // 解析 Schema
  const {
    fields,
    zodSchema,
    defaultValues: schemaDefaults,
  } = useMemo(() => parseFormSchema(schema), [schema]);

  // 合并默认值
  const mergedDefaults = useMemo(
    () => mergeDefaultValues(schemaDefaults, userDefaultValues),
    [schemaDefaults, userDefaultValues]
  );

  // 初始化表单
  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: mergedDefaults,
    mode: 'onChange',
  });

  const { handleSubmit, watch, reset } = methods;

  // 监听表单值变化
  const formValues = watch();

  // 使用联动依赖 hook
  const { getFieldState } = useFieldDependencies(fields, formValues as Record<string, unknown>);

  // 当外部默认值变化时重置表单
  useEffect(() => {
    if (userDefaultValues) {
      reset(mergeDefaultValues(schemaDefaults, userDefaultValues));
    }
  }, [userDefaultValues, reset, schemaDefaults]);

  // 值变化回调
  useEffect(() => {
    onChange?.(formValues as Record<string, unknown>);
  }, [formValues, onChange]);

  // 提交处理
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    await onSubmit?.(data);
  };

  // 渲染字段
  const renderField = (field: FormFieldSchema) => {
    const fieldState = getFieldState(field.name);

    if (field.type === 'array') {
      return (
        <ArrayField
          key={field.name}
          field={field}
          fieldState={fieldState}
          getChildFieldState={getFieldState}
          readonly={readonly}
        />
      );
    }

    if (field.type === 'group' && field.children) {
      // 分组字段
      const groupColSpan = field.layout?.colSpan ?? 12;
      return (
        <div
          key={field.name}
          className="space-y-4 rounded-lg border p-4"
          style={{ gridColumn: `span ${groupColSpan} / span ${groupColSpan}` }}
        >
          <h3 className="font-medium">{field.label}</h3>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <div className="grid grid-cols-12 gap-4">
            {field.children.map((childField) => {
              const childFieldWithPath = {
                ...childField,
                name: `${field.name}.${childField.name}`,
              };
              return renderField(childFieldWithPath);
            })}
          </div>
        </div>
      );
    }

    return (
      <DynamicField key={field.name} field={field} fieldState={fieldState} readonly={readonly} />
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
        {(schema.title || schema.description) && (
          <Card>
            <CardHeader>
              {schema.title && <CardTitle>{schema.title}</CardTitle>}
              {schema.description && <CardDescription>{schema.description}</CardDescription>}
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-12 gap-x-4 gap-y-6">{fields.map(renderField)}</div>
          </CardContent>

          {!readonly && onSubmit && (
            <CardFooter className="justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset(mergedDefaults)}
                disabled={loading}
              >
                重置
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '提交中...' : (schema.submit?.text ?? '提交')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </FormProvider>
  );
}
