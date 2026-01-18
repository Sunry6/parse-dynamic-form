/**
 * 动态表单示例页面 - 使用通用渲染器
 *
 * 这个示例展示了如何使用 UniversalFormRenderer 配合不同的组件库
 */

import { UniversalFormRenderer } from '@/components/forms';
import { nativeRegistry, shadcnRegistry } from '@/components/forms/adapters';
import type { FormSchema } from '@/types/dynamic-form';
import { useState } from 'react';

// 示例表单 Schema（简化版）
const exampleSchema: FormSchema = {
  id: 'insurance-quote',
  title: '保险报价表单',
  version: '1.0.0',
  fields: [
    {
      name: 'insuranceType',
      type: 'select',
      label: '保险类型',
      validation: { required: '请选择保险类型' },
      options: [
        { label: '寿险', value: 'life' },
        { label: '健康险', value: 'health' },
        { label: '意外险', value: 'accident' },
        { label: '车险', value: 'auto' },
      ],
      layout: { colSpan: 6 },
    },
    {
      name: 'coverageAmount',
      type: 'select',
      label: '保额',
      validation: { required: '请选择保额' },
      options: [
        { label: '10万', value: '100000' },
        { label: '50万', value: '500000' },
        { label: '100万', value: '1000000' },
        { label: '200万', value: '2000000' },
      ],
      layout: { colSpan: 6 },
    },
    {
      name: 'applicantInfo',
      type: 'group',
      label: '投保人信息',
      children: [
        {
          name: 'name',
          type: 'text',
          label: '姓名',
          validation: { required: '请输入姓名' },
          layout: { colSpan: 4 },
        },
        {
          name: 'idCard',
          type: 'text',
          label: '身份证号',
          validation: { required: '请输入身份证号' },
          layout: { colSpan: 4 },
        },
        {
          name: 'phone',
          type: 'text',
          label: '手机号',
          validation: { required: '请输入手机号' },
          layout: { colSpan: 4 },
        },
        {
          name: 'gender',
          type: 'radio',
          label: '性别',
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
          layout: { colSpan: 6 },
        },
        {
          name: 'birthDate',
          type: 'date',
          label: '出生日期',
          validation: { required: '请选择出生日期' },
          layout: { colSpan: 6 },
        },
      ],
    },
    {
      name: 'hasExistingConditions',
      type: 'switch',
      label: '是否有既往病史',
      layout: { colSpan: 12 },
    },
    {
      name: 'existingConditions',
      type: 'textarea',
      label: '既往病史详情',
      description: '请详细描述您的既往病史',
      layout: { colSpan: 12 },
      dependencies: [
        {
          field: 'hasExistingConditions',
          condition: 'equals',
          value: true,
          action: 'show',
        },
        {
          field: 'hasExistingConditions',
          condition: 'equals',
          value: true,
          action: 'require',
        },
      ],
    },
    {
      name: 'agreeTerms',
      type: 'checkbox',
      label: '我已阅读并同意《保险条款》',
      validation: { required: '请阅读并同意保险条款' },
      layout: { colSpan: 12 },
    },
  ],
};

export default function UniversalFormExample() {
  // 用于切换不同的组件库
  const [activeRegistry, setActiveRegistry] = useState<'shadcn' | 'native'>('shadcn');
  const [formData, setFormData] = useState<Record<string, unknown> | null>(null);

  const registryMap = {
    shadcn: shadcnRegistry,
    native: nativeRegistry,
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('表单提交:', data);
    setFormData(data);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>通用动态表单示例</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        这个示例展示了如何使用 <code>UniversalFormRenderer</code> 配合不同的组件库渲染同一个表单
        Schema。
      </p>

      {/* 组件库切换器 */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <label style={{ marginRight: '16px', fontWeight: 500 }}>选择组件库：</label>
        <button
          onClick={() => setActiveRegistry('shadcn')}
          style={{
            padding: '8px 16px',
            marginRight: '8px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeRegistry === 'shadcn' ? '#3b82f6' : '#e5e7eb',
            color: activeRegistry === 'shadcn' ? 'white' : '#333',
            cursor: 'pointer',
          }}
        >
          shadcn/ui
        </button>
        <button
          onClick={() => setActiveRegistry('native')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeRegistry === 'native' ? '#3b82f6' : '#e5e7eb',
            color: activeRegistry === 'native' ? 'white' : '#333',
            cursor: 'pointer',
          }}
        >
          原生 HTML
        </button>
        <span style={{ marginLeft: '16px', fontSize: '14px', color: '#666' }}>
          （点击按钮切换，观察表单外观变化）
        </span>
      </div>

      {/* 动态表单 */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white',
        }}
      >
        <UniversalFormRenderer
          key={activeRegistry} // 切换时重新渲染
          schema={exampleSchema}
          onSubmit={handleSubmit}
          componentRegistry={registryMap[activeRegistry]}
        />
      </div>

      {/* 提交结果显示 */}
      {formData && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #10b981',
          }}
        >
          <h3 style={{ margin: '0 0 8px', color: '#065f46' }}>提交成功！</h3>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
            }}
          >
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}

      {/* 使用说明 */}
      <div
        style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#fffbeb',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 12px', color: '#92400e' }}>
          💡 如何为你的公司组件库创建适配器？
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#78350f', lineHeight: 1.8 }}>
          <li>
            复制 <code>src/components/forms/adapters/company-adapter.template.tsx</code> 模板文件
          </li>
          <li>
            将文件重命名为 <code>your-company-adapter.tsx</code>
          </li>
          <li>导入你公司的组件库</li>
          <li>按照模板中的注释，适配每个组件的 Props</li>
          <li>
            导出你的 <code>companyRegistry</code>
          </li>
          <li>
            在使用时传入：
            <code>{`<UniversalFormRenderer componentRegistry={companyRegistry} />`}</code>
          </li>
        </ol>
      </div>
    </div>
  );
}
