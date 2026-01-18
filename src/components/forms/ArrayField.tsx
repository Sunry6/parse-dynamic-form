import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FieldState, FormFieldSchema } from '@/types/dynamic-form';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { DynamicField } from './DynamicField';

interface ArrayFieldProps {
  field: FormFieldSchema;
  fieldState: FieldState;
  getChildFieldState: (fieldName: string) => FieldState;
  readonly?: boolean;
}

/**
 * 数组字段组件
 * 支持动态增删的表单项列表
 */
export function ArrayField({ field, fieldState, getChildFieldState, readonly }: ArrayFieldProps) {
  const { control } = useFormContext();

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

  // 获取子字段的默认值
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
      className={cn('space-y-4', field.layout?.className)}
      style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {field.label}
          {fieldState.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(getChildDefaults())}
          >
            <Plus className="mr-1 h-4 w-4" />
            添加
          </Button>
        )}
      </div>

      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          暂无数据，点击上方按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-end gap-4">
                  <div className="grid flex-1 grid-cols-12 gap-4">
                    {field.children?.map((childField) => {
                      const childName = `${field.name}.${index}.${childField.name}`;
                      const childFieldWithPath = { ...childField, name: childName };
                      const childState = getChildFieldState(childName);

                      return (
                        <DynamicField
                          key={childName}
                          field={childFieldWithPath}
                          fieldState={childState}
                          readonly={readonly}
                        />
                      );
                    })}
                  </div>
                  {canRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-2 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
