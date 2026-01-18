import type {
  FieldValidation,
  FormFieldSchema,
  FormSchema,
  ParsedSchema,
} from '@/types/dynamic-form';
import { z } from 'zod';

/**
 * 根据字段校验规则生成 Zod Schema
 */
function createFieldZodSchema(field: FormFieldSchema): z.ZodTypeAny {
  const { type, validation = {} } = field;

  let schema: z.ZodTypeAny;

  // 根据字段类型创建基础 schema
  switch (type) {
    case 'number':
      schema = createNumberSchema(validation);
      break;
    case 'checkbox':
      if (field.options && field.options.length > 1) {
        // 多选 checkbox
        schema = z.array(z.union([z.string(), z.number(), z.boolean()]));
      } else {
        // 单个 checkbox（开关）
        schema = z.boolean();
      }
      break;
    case 'switch':
      schema = z.boolean();
      break;
    case 'date':
    case 'datetime':
      schema = z.string().or(z.date());
      break;
    case 'file':
      schema = z.any(); // 文件类型特殊处理
      break;
    case 'group':
      if (field.children) {
        const childSchemas: Record<string, z.ZodTypeAny> = {};
        field.children.forEach((child) => {
          childSchemas[child.name] = createFieldZodSchema(child);
        });
        schema = z.object(childSchemas);
      } else {
        schema = z.object({});
      }
      break;
    case 'array':
      if (field.children && field.children.length > 0) {
        const itemSchema: Record<string, z.ZodTypeAny> = {};
        field.children.forEach((child) => {
          itemSchema[child.name] = createFieldZodSchema(child);
        });
        let arraySchema = z.array(z.object(itemSchema));
        if (field.minItems !== undefined) {
          arraySchema = arraySchema.min(field.minItems, `至少需要 ${field.minItems} 项`);
        }
        if (field.maxItems !== undefined) {
          arraySchema = arraySchema.max(field.maxItems, `最多只能有 ${field.maxItems} 项`);
        }
        schema = arraySchema;
      } else {
        schema = z.array(z.any());
      }
      break;
    case 'select':
    case 'radio':
      // 支持 string 和 number 类型的值
      schema = z.union([z.string(), z.number()]);
      break;
    case 'email':
      schema = createStringSchema(validation, true);
      break;
    default:
      // text, password, textarea, etc.
      schema = createStringSchema(validation);
  }

  // 处理必填/可选
  if (!validation.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * 创建字符串类型的 Zod Schema
 */
function createStringSchema(validation: FieldValidation, isEmail = false): z.ZodString {
  let schema = z.string();

  if (isEmail || validation.email) {
    const message =
      typeof validation.email === 'string' ? validation.email : '请输入有效的邮箱地址';
    schema = schema.email(message);
  }

  if (validation.url) {
    const message = typeof validation.url === 'string' ? validation.url : '请输入有效的 URL';
    schema = schema.url(message);
  }

  if (validation.required) {
    const message =
      typeof validation.required === 'string' ? validation.required : '此字段为必填项';
    schema = schema.min(1, message);
  }

  if (validation.minLength) {
    const { value, message } =
      typeof validation.minLength === 'number'
        ? { value: validation.minLength, message: `最少需要 ${validation.minLength} 个字符` }
        : validation.minLength;
    schema = schema.min(value, message);
  }

  if (validation.maxLength) {
    const { value, message } =
      typeof validation.maxLength === 'number'
        ? { value: validation.maxLength, message: `最多只能有 ${validation.maxLength} 个字符` }
        : validation.maxLength;
    schema = schema.max(value, message);
  }

  if (validation.pattern) {
    const { value, message } =
      typeof validation.pattern === 'string'
        ? { value: validation.pattern, message: '格式不正确' }
        : validation.pattern;
    schema = schema.regex(new RegExp(value), message);
  }

  return schema;
}

/**
 * 创建数字类型的 Zod Schema
 */
function createNumberSchema(validation: FieldValidation): z.ZodNumber {
  let schema = z.number({ invalid_type_error: '请输入有效的数字' });

  if (validation.min !== undefined) {
    const { value, message } =
      typeof validation.min === 'number'
        ? { value: validation.min, message: `不能小于 ${validation.min}` }
        : validation.min;
    schema = schema.min(value, message);
  }

  if (validation.max !== undefined) {
    const { value, message } =
      typeof validation.max === 'number'
        ? { value: validation.max, message: `不能大于 ${validation.max}` }
        : validation.max;
    schema = schema.max(value, message);
  }

  return schema;
}

/**
 * 获取字段的默认值
 */
function getFieldDefaultValue(field: FormFieldSchema): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'number':
      return undefined;
    case 'checkbox':
      return field.options && field.options.length > 1 ? [] : false;
    case 'switch':
      return false;
    case 'group':
      if (field.children) {
        const groupDefaults: Record<string, unknown> = {};
        field.children.forEach((child) => {
          groupDefaults[child.name] = getFieldDefaultValue(child);
        });
        return groupDefaults;
      }
      return {};
    case 'array':
      return [];
    default:
      return '';
  }
}

/**
 * 解析表单 Schema
 * 将 FormSchema 转换为 Zod Schema 和默认值
 */
export function parseFormSchema(schema: FormSchema): ParsedSchema {
  const zodSchemaFields: Record<string, z.ZodTypeAny> = {};
  const defaultValues: Record<string, unknown> = {};

  const processFields = (fields: FormFieldSchema[], _prefix = '') => {
    fields.forEach((field) => {
      // 生成 Zod schema
      zodSchemaFields[field.name] = createFieldZodSchema(field);

      // 生成默认值
      defaultValues[field.name] = getFieldDefaultValue(field);
    });
  };

  processFields(schema.fields);

  return {
    fields: schema.fields,
    zodSchema: z.object(zodSchemaFields),
    defaultValues,
  };
}

/**
 * 合并用户提供的默认值和 schema 中的默认值
 */
export function mergeDefaultValues(
  schemaDefaults: Record<string, unknown>,
  userDefaults?: Record<string, unknown>
): Record<string, unknown> {
  if (!userDefaults) {
    return schemaDefaults;
  }

  return {
    ...schemaDefaults,
    ...userDefaults,
  };
}

/**
 * 扁平化嵌套字段，用于表单注册
 */
export function flattenFields(fields: FormFieldSchema[], prefix = ''): FormFieldSchema[] {
  const result: FormFieldSchema[] = [];

  fields.forEach((field) => {
    const fieldPath = prefix ? `${prefix}.${field.name}` : field.name;
    const flatField = { ...field, name: fieldPath };

    if (field.type === 'group' && field.children) {
      // group 类型：递归处理子字段
      result.push(...flattenFields(field.children, fieldPath));
    } else if (field.type === 'array' && field.children) {
      // array 类型：保留原始结构，由 ArrayField 组件处理
      result.push(flatField);
    } else {
      result.push(flatField);
    }
  });

  return result;
}
