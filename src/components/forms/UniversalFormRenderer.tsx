import { useFieldDependencies } from '@/lib/field-dependencies';
import { mergeDefaultValues, parseFormSchema } from '@/lib/schema-parser';
import type { ComponentRegistry } from '@/types/component-registry';
import type { DynamicFormProps, FormFieldSchema } from '@/types/dynamic-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { shadcnRegistry } from './adapters/shadcn-adapter';
import { ComponentRegistryProvider, useComponentRegistry } from './ComponentRegistry';
import { UniversalArrayField } from './UniversalArrayField';
import { UniversalField } from './UniversalField';

interface UniversalFormRendererProps extends DynamicFormProps {
  /**
   * 自定义组件注册表
   * 如果不传，默认使用 shadcn 组件
   */
  componentRegistry?: ComponentRegistry;
}

/**
 * 通用动态表单渲染器（内部实现）
 */
function UniversalFormRendererInner({
  schema,
  defaultValues: userDefaultValues,
  onSubmit,
  onChange,
  readonly,
  loading,
  className,
}: DynamicFormProps) {
  const registry = useComponentRegistry();

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
  const formValues = watch();

  // 联动逻辑
  const { getFieldState } = useFieldDependencies(fields, formValues as Record<string, unknown>);

  // 重置表单
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
        <UniversalArrayField
          key={field.name}
          field={field}
          fieldState={fieldState}
          getChildFieldState={getFieldState}
          readonly={readonly}
        />
      );
    }

    if (field.type === 'group' && field.children) {
      const groupColSpan = field.layout?.colSpan ?? 12;
      return (
        <div
          key={field.name}
          style={{
            gridColumn: `span ${groupColSpan} / span ${groupColSpan}`,
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontWeight: 500 }}>{field.label}</h3>
          {field.description && <registry.HelperText text={field.description} />}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '16px',
              marginTop: '16px',
            }}
          >
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
      <UniversalField key={field.name} field={field} fieldState={fieldState} readonly={readonly} />
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={className}>
        {/* 表单标题 */}
        {(schema.title || schema.description) && (
          <registry.Card title={schema.title} description={schema.description}>
            <div />
          </registry.Card>
        )}

        {/* 表单内容 */}
        <registry.Card
          footer={
            !readonly && onSubmit ? (
              <>
                <registry.Button
                  variant="outline"
                  onClick={() => reset(mergedDefaults)}
                  disabled={loading}
                >
                  重置
                </registry.Button>
                <registry.Button type="submit" disabled={loading}>
                  {loading ? '提交中...' : (schema.submit?.text ?? '提交')}
                </registry.Button>
              </>
            ) : undefined
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '16px',
            }}
          >
            {fields.map(renderField)}
          </div>
        </registry.Card>
      </form>
    </FormProvider>
  );
}

/**
 * 通用动态表单渲染器
 *
 * 支持自定义组件注册表，可以轻松替换为任何组件库
 *
 * @example
 * // 使用默认 shadcn 组件
 * <UniversalFormRenderer schema={schema} onSubmit={handleSubmit} />
 *
 * @example
 * // 使用自定义组件库
 * import { myCompanyRegistry } from './my-company-adapter';
 * <UniversalFormRenderer
 *   schema={schema}
 *   onSubmit={handleSubmit}
 *   componentRegistry={myCompanyRegistry}
 * />
 */
export function UniversalFormRenderer({
  componentRegistry = shadcnRegistry,
  ...props
}: UniversalFormRendererProps) {
  return (
    <ComponentRegistryProvider registry={componentRegistry}>
      <UniversalFormRendererInner {...props} />
    </ComponentRegistryProvider>
  );
}
