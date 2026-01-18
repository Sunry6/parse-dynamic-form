import type { FieldState, FormFieldSchema } from '@/types/dynamic-form';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useComponentRegistry } from './ComponentRegistry';
import { UniversalField } from './UniversalField';

interface UniversalArrayFieldProps {
  field: FormFieldSchema;
  fieldState: FieldState;
  getChildFieldState: (fieldName: string) => FieldState;
  readonly?: boolean;
}

/**
 * 通用数组字段组件
 * 使用组件注册表渲染，与具体组件库无关
 */
export function UniversalArrayField({
  field,
  fieldState,
  getChildFieldState,
  readonly,
}: UniversalArrayFieldProps) {
  const { control } = useFormContext();
  const registry = useComponentRegistry();

  const {
    fields: items,
    append,
    remove,
  } = useFieldArray({
    control,
    name: field.name,
  });

  if (!fieldState.visible) {
    return null;
  }

  const isDisabled = fieldState.disabled || readonly;
  const canAdd = !isDisabled && (field.maxItems === undefined || items.length < field.maxItems);
  const canRemove = !isDisabled && (field.minItems === undefined || items.length > field.minItems);

  const getChildDefaults = () => {
    const defaults: Record<string, unknown> = {};
    field.children?.forEach((child) => {
      defaults[child.name] = child.defaultValue ?? '';
    });
    return defaults;
  };

  const colSpan = field.layout?.colSpan ?? 12;

  return (
    <div
      className={field.layout?.className}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        marginBottom: '16px',
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <registry.Label required={fieldState.required}>{field.label}</registry.Label>
        {canAdd && (
          <registry.Button variant="outline" size="sm" onClick={() => append(getChildDefaults())}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            添加
          </registry.Button>
        )}
      </div>

      {/* 描述 */}
      {field.description && <registry.HelperText text={field.description} />}

      {/* 列表内容 */}
      {items.length === 0 ? (
        <div
          style={{
            border: '1px dashed #ccc',
            borderRadius: '4px',
            padding: '16px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          暂无数据，点击上方按钮添加
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, index) => (
            <registry.Card key={item.id}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                <div
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: '16px',
                  }}
                >
                  {field.children?.map((childField) => {
                    const childName = `${field.name}.${index}.${childField.name}`;
                    const childFieldWithPath = { ...childField, name: childName };
                    const childState = getChildFieldState(childName);

                    return (
                      <UniversalField
                        key={childName}
                        field={childFieldWithPath}
                        fieldState={childState}
                        readonly={readonly}
                      />
                    );
                  })}
                </div>
                {canRemove && (
                  <registry.Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  </registry.Button>
                )}
              </div>
            </registry.Card>
          ))}
        </div>
      )}
    </div>
  );
}
