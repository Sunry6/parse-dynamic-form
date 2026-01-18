# 动态表单组件使用指南

本指南帮助你在不同页面复用动态表单组件，以及如何扩展和自定义。

## 目录

1. [快速开始](#快速开始)
2. [核心概念](#核心概念)
3. [Schema 定义详解](#schema-定义详解)
4. [联动逻辑配置](#联动逻辑配置)
5. [远程选项加载](#远程选项加载)
6. [扩展自定义字段类型](#扩展自定义字段类型)
7. [扩展校验规则](#扩展校验规则)
8. [实际使用场景](#实际使用场景)
9. [使用自定义组件库](#使用自定义组件库组件库解耦)

---

## 快速开始

### 方式一：直接使用 Schema（推荐用于原型开发）

```tsx
import { DynamicFormRenderer } from '@/components/forms/DynamicFormRenderer';
import type { FormSchema } from '@/types/dynamic-form';

const mySchema: FormSchema = {
  id: 'my-form',
  title: '我的表单',
  fields: [
    {
      name: 'username',
      type: 'text',
      label: '用户名',
      validation: { required: '请输入用户名' },
    },
  ],
};

function MyPage() {
  return (
    <DynamicFormRenderer schema={mySchema} onSubmit={(data) => console.log('提交数据:', data)} />
  );
}
```

### 方式二：从 API 获取 Schema（推荐用于生产环境）

```tsx
import { DynamicFormRenderer } from '@/components/forms/DynamicFormRenderer';
import { useDynamicForm } from '@/hooks/useDynamicForm';

function MyPage() {
  const { schema, defaultValues, isLoadingSchema, submitForm } = useDynamicForm({
    schemaUrl: '/api/forms/my-form-schema', // 获取 Schema 的 API
    initialValuesUrl: '/api/forms/my-form-data', // 获取初始数据的 API（可选）
    submitUrl: '/api/forms/submit', // 提交表单的 API
    onSubmitSuccess: (response) => {
      alert('提交成功！');
    },
    onSubmitError: (error) => {
      alert('提交失败：' + error.message);
    },
  });

  if (isLoadingSchema) return <div>加载中...</div>;
  if (!schema) return <div>无法加载表单</div>;

  return (
    <DynamicFormRenderer schema={schema} defaultValues={defaultValues} onSubmit={submitForm} />
  );
}
```

---

## 核心概念

### 文件结构说明

```
src/
├── types/
│   └── dynamic-form.ts       # 所有类型定义，修改字段类型在这里
├── lib/
│   ├── schema-parser.ts      # Schema 解析器，处理 Zod 校验生成
│   └── field-dependencies.ts # 联动逻辑处理
├── hooks/
│   └── useDynamicForm.ts     # 表单状态管理 Hook
└── components/forms/
    ├── DynamicFormRenderer.tsx  # 主渲染组件
    ├── DynamicField.tsx         # 单字段渲染器
    └── ArrayField.tsx           # 数组字段组件
```

### 数据流

```
后端 API → Schema JSON → useDynamicForm → DynamicFormRenderer
                                              ↓
                                    parseFormSchema (生成 Zod 校验)
                                              ↓
                                    useFieldDependencies (处理联动)
                                              ↓
                                    DynamicField (渲染字段)
```

---

## Schema 定义详解

### 基本字段结构

```typescript
interface FormFieldSchema {
  name: string; // 字段名（唯一）
  type: FieldType; // 字段类型
  label: string; // 显示标签
  placeholder?: string;
  defaultValue?: unknown;
  description?: string; // 帮助文本
  disabled?: boolean;
  hidden?: boolean;
  options?: FieldOption[]; // 下拉/单选/多选的选项（静态）
  optionsKey?: string; // listMap 中的 key（从 sessionStorage 获取选项）
  optionsUrl?: string; // 远程获取选项的 API 地址
  optionsDependsOn?: string[]; // 选项依赖（级联选择）
  validation?: FieldValidation; // 校验规则
  dependencies?: FieldDependency[]; // 联动配置
  layout?: {
    colSpan?: number; // 列宽（1-12）
    className?: string;
  };
}
```

### 支持的字段类型

| 类型       | 说明     | 示例             |
| ---------- | -------- | ---------------- |
| `text`     | 文本输入 | 姓名、地址       |
| `number`   | 数字输入 | 年龄、金额       |
| `email`    | 邮箱输入 | 自动校验邮箱格式 |
| `password` | 密码输入 | 密码字段         |
| `textarea` | 多行文本 | 备注、描述       |
| `select`   | 下拉选择 | 省份、状态       |
| `radio`    | 单选按钮 | 性别、是否       |
| `checkbox` | 复选框   | 单个勾选或多选   |
| `switch`   | 开关     | 启用/禁用        |
| `date`     | 日期选择 | 出生日期         |
| `datetime` | 日期时间 | 预约时间         |
| `group`    | 字段分组 | 地址信息组       |
| `array`    | 数组字段 | 受益人列表       |

### 完整 Schema 示例

```typescript
const insuranceFormSchema: FormSchema = {
  id: 'insurance-application',
  version: '1.0.0',
  title: '投保申请表',
  description: '请如实填写以下信息',
  layout: {
    columns: 2, // 2列布局
    labelPosition: 'top', // 标签在上方
  },
  fields: [
    // 基本文本字段
    {
      name: 'fullName',
      type: 'text',
      label: '姓名',
      placeholder: '请输入真实姓名',
      validation: {
        required: '姓名为必填项',
        minLength: { value: 2, message: '姓名至少2个字符' },
        maxLength: { value: 50, message: '姓名最多50个字符' },
      },
      layout: { colSpan: 6 }, // 占6列（一半宽度）
    },

    // 数字字段
    {
      name: 'age',
      type: 'number',
      label: '年龄',
      validation: {
        required: '请输入年龄',
        min: { value: 18, message: '投保人须年满18周岁' },
        max: { value: 65, message: '投保人年龄不能超过65周岁' },
      },
      layout: { colSpan: 6 },
    },

    // 下拉选择
    {
      name: 'insuranceType',
      type: 'select',
      label: '保险类型',
      placeholder: '请选择保险类型',
      options: [
        { label: '寿险', value: 'life' },
        { label: '医疗险', value: 'medical' },
        { label: '意外险', value: 'accident' },
        { label: '重疾险', value: 'critical_illness' },
      ],
      validation: { required: '请选择保险类型' },
      layout: { colSpan: 6 },
    },

    // 单选按钮
    {
      name: 'paymentPeriod',
      type: 'radio',
      label: '缴费方式',
      options: [
        { label: '趸交', value: 'single' },
        { label: '年交', value: 'annual' },
        { label: '月交', value: 'monthly' },
      ],
      defaultValue: 'annual',
      layout: { colSpan: 6 },
    },

    // 开关
    {
      name: 'hasExistingPolicy',
      type: 'switch',
      label: '是否有在保保单',
      defaultValue: false,
      layout: { colSpan: 12 },
    },

    // 条件显示的字段
    {
      name: 'existingPolicyNumber',
      type: 'text',
      label: '现有保单号',
      placeholder: '请输入保单号',
      layout: { colSpan: 6 },
      dependencies: [
        {
          field: 'hasExistingPolicy',
          condition: 'equals',
          value: true,
          action: 'show',
        },
      ],
    },

    // 数组字段（可动态增删）
    {
      name: 'beneficiaries',
      type: 'array',
      label: '受益人信息',
      description: '请添加受益人，受益比例总和应为100%',
      minItems: 1,
      maxItems: 5,
      layout: { colSpan: 12 },
      children: [
        {
          name: 'name',
          type: 'text',
          label: '姓名',
          validation: { required: '请输入受益人姓名' },
          layout: { colSpan: 4 },
        },
        {
          name: 'relationship',
          type: 'select',
          label: '关系',
          options: [
            { label: '配偶', value: 'spouse' },
            { label: '子女', value: 'child' },
            { label: '父母', value: 'parent' },
          ],
          layout: { colSpan: 4 },
        },
        {
          name: 'ratio',
          type: 'number',
          label: '受益比例(%)',
          validation: {
            required: true,
            min: { value: 1, message: '最小1%' },
            max: { value: 100, message: '最大100%' },
          },
          layout: { colSpan: 4 },
        },
      ],
    },
  ],
  submit: {
    text: '提交申请',
    url: '/api/insurance/apply',
    method: 'POST',
  },
};
```

---

## 联动逻辑配置

### 支持的条件类型

| 条件          | 说明                | 示例                  |
| ------------- | ------------------- | --------------------- |
| `equals`      | 等于                | `value: 'individual'` |
| `notEquals`   | 不等于              | `value: 'company'`    |
| `contains`    | 包含（数组/字符串） | `value: 'VIP'`        |
| `greaterThan` | 大于                | `value: 100`          |
| `lessThan`    | 小于                | `value: 100`          |
| `in`          | 在数组中            | `value: ['A', 'B']`   |
| `notIn`       | 不在数组中          | `value: ['C', 'D']`   |
| `isEmpty`     | 为空                | 无需 value            |
| `isNotEmpty`  | 不为空              | 无需 value            |

### 支持的动作

| 动作       | 说明                                     |
| ---------- | ---------------------------------------- |
| `show`     | 显示字段（条件满足时显示，不满足时隐藏） |
| `hide`     | 隐藏字段（条件满足时隐藏，不满足时显示） |
| `enable`   | 启用字段                                 |
| `disable`  | 禁用字段                                 |
| `require`  | 设为必填                                 |
| `optional` | 设为可选                                 |

### 联动示例

```typescript
// 示例1：根据投保人类型显示不同字段
{
  name: 'companyName',
  type: 'text',
  label: '企业名称',
  dependencies: [
    {
      field: 'applicantType',
      condition: 'equals',
      value: 'company',
      action: 'show',
    },
  ],
}

// 示例2：多条件联动（金额大于100万时需要额外审批）
{
  name: 'managerApproval',
  type: 'checkbox',
  label: '需要经理审批',
  dependencies: [
    {
      field: 'amount',
      condition: 'greaterThan',
      value: 1000000,
      action: 'show',
    },
  ],
}

// 示例3：根据选择动态设置必填
{
  name: 'otherReason',
  type: 'textarea',
  label: '其他原因说明',
  dependencies: [
    {
      field: 'reason',
      condition: 'equals',
      value: 'other',
      action: 'show',
    },
    {
      field: 'reason',
      condition: 'equals',
      value: 'other',
      action: 'require',
    },
  ],
}
```

---

## 远程选项加载

动态表单支持从 `sessionStorage` 的 `listMap` 中加载下拉选项，适用于数据字典、枚举值等场景。

### 数据结构

`listMap` 保存在 `sessionStorage` 中，支持两种格式：

```typescript
// sessionStorage.getItem('listMap') 的结构
{
  // 简单列表：直接是选项数组
  "occupations": [
    { "label": "公务员", "value": "civil_servant" },
    { "label": "企业员工", "value": "employee" },
    { "label": "自由职业", "value": "freelancer" }
  ],

  // 级联列表：根据父级值获取子列表
  "cities": {
    "BJ": [
      { "label": "东城区", "value": "BJ_DC" },
      { "label": "西城区", "value": "BJ_XC" }
    ],
    "SH": [
      { "label": "黄浦区", "value": "SH_HP" },
      { "label": "静安区", "value": "SH_JA" }
    ]
  }
}
```

### 初始化 listMap

通常在用户登录后，从后端获取数据字典并保存：

```typescript
import { setListMap } from '@/hooks/useFieldOptions';

// 登录成功后
async function onLoginSuccess() {
  const dictData = await fetchDictionary(); // 从后端获取
  setListMap(dictData);
}
```

### Schema 配置

#### 简单列表

```typescript
{
  name: 'occupation',
  type: 'select',
  label: '职业',
  placeholder: '请选择职业',
  // 使用 optionsKey 指定 listMap 中的 key
  optionsKey: 'occupations',
}
```

#### 级联选择（省市联动）

```typescript
// 省份选择
{
  name: 'province',
  type: 'select',
  label: '省份',
  optionsKey: 'provinces',
  layout: { colSpan: 6 },
},
// 城市选择（依赖省份）
{
  name: 'city',
  type: 'select',
  label: '城市',
  placeholder: '请先选择省份',
  optionsKey: 'cities',
  // 当 province 变化时，自动重新加载城市列表
  optionsDependsOn: ['province'],
  layout: { colSpan: 6 },
}
```

### 工具函数

```typescript
import {
  getListMap, // 获取整个 listMap
  setListMap, // 设置 listMap
  getOptionsFromListMap, // 获取指定 key 的选项
} from '@/hooks/useFieldOptions';

// 获取简单列表
const occupations = getOptionsFromListMap('occupations');

// 获取级联列表（传入父级值）
const cities = getOptionsFromListMap('cities', 'BJ');
```

### 在表单外使用（独立 Hook）

如果需要在非表单场景使用，可以用 `useFieldOptionsStandalone`：

```typescript
import { useFieldOptionsStandalone } from '@/hooks/useFieldOptions';

function MyComponent() {
  const [province, setProvince] = useState('');

  const { options: cities, isLoading } = useFieldOptionsStandalone({
    optionsKey: 'cities',
    parentValue: province,
  });

  return (
    <select>
      {cities.map(city => (
        <option key={city.value} value={city.value}>{city.label}</option>
      ))}
    </select>
  );
}
```

### 优先级说明

选项加载的优先级：

1. `optionsKey` - 从 sessionStorage 的 listMap 获取
2. `optionsUrl` - 从远程 API 获取
3. `options` - 使用 Schema 中定义的静态选项

---

## 扩展自定义字段类型

### 步骤 1：添加新类型定义

在 `src/types/dynamic-form.ts` 中添加新类型：

```typescript
export type FieldType =
  | 'text'
  | 'number'
  // ... 现有类型
  | 'richtext' // 新增：富文本
  | 'upload' // 新增：文件上传
  | 'cascader'; // 新增：级联选择
```

### 步骤 2：实现字段渲染

在 `src/components/forms/DynamicField.tsx` 的 `FieldControl` 组件中添加：

```tsx
function FieldControl({ schema, value, onChange, onBlur, disabled, error }: FieldControlProps) {
  const { type, name, placeholder, options = [] } = schema;

  switch (type) {
    // ... 现有 case

    case 'richtext':
      return (
        <RichTextEditor id={name} value={value as string} onChange={onChange} disabled={disabled} />
      );

    case 'upload':
      return (
        <FileUploader
          id={name}
          value={value}
          onChange={onChange}
          accept={schema.props?.accept as string}
          maxSize={schema.props?.maxSize as number}
          disabled={disabled}
        />
      );

    case 'cascader':
      return (
        <Cascader
          id={name}
          value={value}
          onChange={onChange}
          options={schema.props?.cascaderOptions}
          disabled={disabled}
        />
      );

    // ...
  }
}
```

### 步骤 3：添加 Zod 校验支持（如需要）

在 `src/lib/schema-parser.ts` 的 `createFieldZodSchema` 函数中添加：

```typescript
function createFieldZodSchema(field: FormFieldSchema): z.ZodTypeAny {
  switch (type) {
    // ... 现有 case

    case 'richtext':
      // 富文本可能是 HTML 字符串
      return z.string();

    case 'upload':
      // 文件可能是 File 对象或 URL 字符串
      return z.union([z.instanceof(File), z.string()]).optional();

    case 'cascader':
      // 级联选择返回数组
      return z.array(z.string());
  }
}
```

---

## 扩展校验规则

### 添加自定义校验器

在 Schema 中使用 `validation.custom`，然后在使用时注入校验器：

```tsx
// Schema 定义
{
  name: 'idNumber',
  type: 'text',
  label: '身份证号',
  validation: {
    required: true,
    custom: 'validateIdNumber', // 引用自定义校验器名称
  },
}

// 使用时传入校验器
<DynamicFormRenderer
  schema={schema}
  validators={{
    validateIdNumber: (value, formValues) => {
      if (typeof value !== 'string') return '请输入身份证号';
      if (!/^\d{17}[\dXx]$/.test(value)) return '身份证号格式不正确';
      // 可以访问其他字段值进行复合校验
      if (formValues.applicantType === 'company') {
        return true; // 企业无需校验身份证
      }
      return true;
    },
  }}
/>
```

---

## 实际使用场景

### 场景 1：多个页面复用同一表单

```tsx
// components/forms/CustomerInfoForm.tsx
import { DynamicFormRenderer } from '@/components/forms/DynamicFormRenderer';
import { customerInfoSchema } from '@/schemas/customer-info';

interface CustomerInfoFormProps {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  readonly?: boolean;
}

export function CustomerInfoForm({ defaultValues, onSubmit, readonly }: CustomerInfoFormProps) {
  return (
    <DynamicFormRenderer
      schema={customerInfoSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      readonly={readonly}
    />
  );
}

// 在投保页面使用
function InsurancePage() {
  return <CustomerInfoForm onSubmit={handleSubmit} />;
}

// 在理赔页面使用（只读模式）
function ClaimPage() {
  return <CustomerInfoForm defaultValues={customerData} readonly />;
}
```

### 场景 2：不同业务使用不同 Schema

```tsx
// hooks/useFormSchema.ts
import { useDynamicForm } from '@/hooks/useDynamicForm';

// 根据业务类型获取不同的 Schema
export function useBusinessForm(businessType: 'insurance' | 'claim' | 'endorsement') {
  const schemaUrlMap = {
    insurance: '/api/schemas/insurance',
    claim: '/api/schemas/claim',
    endorsement: '/api/schemas/endorsement',
  };

  return useDynamicForm({
    schemaUrl: schemaUrlMap[businessType],
    submitUrl: `/api/${businessType}/submit`,
  });
}

// 使用
function BusinessFormPage({ businessType }) {
  const { schema, submitForm, isLoadingSchema } = useBusinessForm(businessType);

  if (isLoadingSchema) return <Loading />;

  return <DynamicFormRenderer schema={schema} onSubmit={submitForm} />;
}
```

### 场景 3：表单嵌入弹窗

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicFormRenderer } from '@/components/forms/DynamicFormRenderer';

function FormDialog({ open, onClose, schema, onSubmit }) {
  const handleSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{schema.title}</DialogTitle>
        </DialogHeader>
        <DynamicFormRenderer schema={schema} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
```

### 场景 4：分步表单（向导）

```tsx
function StepWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  // 每一步使用不同的 Schema
  const stepSchemas = [basicInfoSchema, insuranceDetailSchema, paymentSchema, confirmSchema];

  const handleStepSubmit = (data) => {
    setFormData({ ...formData, ...data });
    if (step < stepSchemas.length - 1) {
      setStep(step + 1);
    } else {
      // 最后一步，提交全部数据
      submitAllData(formData);
    }
  };

  return (
    <div>
      <StepIndicator current={step} total={stepSchemas.length} />
      <DynamicFormRenderer
        key={step}
        schema={stepSchemas[step]}
        defaultValues={formData}
        onSubmit={handleStepSubmit}
      />
      {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
    </div>
  );
}
```

---

## 后端 API 设计建议

### Schema API 响应格式

```json
GET /api/forms/{formId}/schema

{
  "success": true,
  "data": {
    "id": "insurance-form",
    "version": "1.0.0",
    "title": "投保申请",
    "fields": [...]
  }
}
```

### 表单数据 API

```json
GET /api/forms/{formId}/data/{recordId}

{
  "success": true,
  "data": {
    "fullName": "张三",
    "age": 30,
    ...
  }
}
```

### 提交 API

```json
POST /api/forms/{formId}/submit

Request:
{
  "fullName": "张三",
  "age": 30,
  ...
}

Response:
{
  "success": true,
  "data": {
    "id": "record-123",
    "status": "submitted"
  }
}
```

---

## 常见问题

### Q: 如何处理选项从后端动态加载？

使用 `optionsUrl` 配置：

```typescript
{
  name: 'province',
  type: 'select',
  label: '省份',
  optionsUrl: '/api/regions/provinces', // 会自动请求并填充 options
}
```

### Q: 如何实现级联选择（如省市区）？

使用 `optionsDependsOn` 配置：

```typescript
{
  name: 'city',
  type: 'select',
  label: '城市',
  optionsUrl: '/api/regions/cities',
  optionsDependsOn: ['province'], // 当 province 变化时重新请求
}
```

### Q: 如何处理复杂的跨字段校验？

使用自定义校验器或在提交前进行校验：

```tsx
const handleSubmit = (data) => {
  // 校验受益比例总和
  const totalRatio = data.beneficiaries.reduce((sum, b) => sum + b.ratio, 0);
  if (totalRatio !== 100) {
    alert('受益比例总和必须为100%');
    return;
  }
  submitForm(data);
};
```

---

## 使用自定义组件库（组件库解耦）

动态表单系统支持与任意 UI 组件库集成，不强制依赖 shadcn/ui。

### 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                    UniversalFormRenderer                     │
│    (组件库无关的表单渲染器，通过 componentRegistry 注入组件)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component Registry                         │
│         (组件注册表接口，定义所有需要的 UI 组件)               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ shadcn-adapter│    │ native-adapter│    │ your-adapter  │
│   (默认提供)   │    │   (示例)      │    │  (你来实现)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 使用方式

#### 1. 使用默认 shadcn 组件

```tsx
import { UniversalFormRenderer } from '@/components/forms';
import { shadcnRegistry } from '@/components/forms/adapters';

<UniversalFormRenderer schema={mySchema} componentRegistry={shadcnRegistry} />;
```

#### 2. 使用原生 HTML（无样式）

```tsx
import { UniversalFormRenderer } from '@/components/forms';
import { nativeRegistry } from '@/components/forms/adapters';

<UniversalFormRenderer schema={mySchema} componentRegistry={nativeRegistry} />;
```

#### 3. 使用你公司的组件库

**步骤 1：复制适配器模板**

```bash
cp src/components/forms/adapters/company-adapter.template.tsx \
   src/components/forms/adapters/my-company-adapter.tsx
```

**步骤 2：导入你的组件库并适配**

```tsx
// my-company-adapter.tsx
import {
  Input as CompanyInput,
  Select as CompanySelect,
  Button as CompanyButton,
  // ...
} from '@your-company/ui-components';

const TextInput: React.FC<TextInputProps> = ({ value, onChange, ...props }) => {
  return (
    <CompanyInput
      value={value}
      // 适配不同的回调签名
      onValueChange={onChange} // 或 onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};

// ... 其他组件适配

export const myCompanyRegistry: ComponentRegistry = {
  TextInput,
  // ... 其他组件
};
```

**步骤 3：使用你的适配器**

```tsx
import { UniversalFormRenderer } from '@/components/forms';
import { myCompanyRegistry } from './adapters/my-company-adapter';

<UniversalFormRenderer schema={mySchema} componentRegistry={myCompanyRegistry} />;
```

### 需要适配的组件清单

| 组件名          | 用途       | 必需    |
| --------------- | ---------- | ------- |
| `TextInput`     | 文本输入框 | ✅      |
| `Textarea`      | 多行文本框 | ✅      |
| `Select`        | 下拉选择器 | ✅      |
| `RadioGroup`    | 单选按钮组 | ✅      |
| `Checkbox`      | 复选框     | ✅      |
| `CheckboxGroup` | 复选框组   | ⚠️ 可选 |
| `Switch`        | 开关       | ⚠️ 可选 |
| `DatePicker`    | 日期选择器 | ⚠️ 可选 |
| `Label`         | 标签       | ✅      |
| `Button`        | 按钮       | ✅      |
| `Card`          | 卡片容器   | ✅      |
| `FieldWrapper`  | 字段包装器 | ✅      |
| `ErrorMessage`  | 错误提示   | ✅      |
| `HelperText`    | 帮助文本   | ⚠️ 可选 |

### 组件 Props 接口参考

所有组件接口定义在 `src/types/component-registry.ts`，关键接口示例：

```typescript
interface TextInputProps {
  id: string;
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  type?: 'text' | 'number' | 'email' | 'password';
}

interface SelectProps {
  id: string;
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  options: Array<{ label: string; value: string | number; disabled?: boolean }>;
  error?: boolean;
}
```

访问 `/universal-form` 路由可以看到切换不同组件库的效果演示。

---

有任何问题欢迎继续讨论！
