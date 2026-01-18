/**
 * 表单 Schema 集中管理
 * 可以在这里定义所有的表单 Schema，或者从后端 API 获取
 */
import type { FormSchema } from '@/types/dynamic-form';

/**
 * 客户基本信息表单 Schema
 * 可在多个页面复用：投保、理赔、保全等
 */
export const customerInfoSchema: FormSchema = {
  id: 'customer-info',
  title: '客户信息',
  fields: [
    {
      name: 'customerType',
      type: 'radio',
      label: '客户类型',
      options: [
        { label: '个人', value: 'individual' },
        { label: '企业', value: 'company' },
      ],
      defaultValue: 'individual',
      validation: { required: '请选择客户类型' },
      layout: { colSpan: 12 },
    },
    {
      name: 'name',
      type: 'text',
      label: '姓名/企业名称',
      placeholder: '请输入',
      validation: { required: '请输入姓名或企业名称' },
      layout: { colSpan: 6 },
    },
    {
      name: 'idNumber',
      type: 'text',
      label: '证件号码',
      placeholder: '请输入证件号码',
      validation: { required: '请输入证件号码' },
      layout: { colSpan: 6 },
    },
    {
      name: 'phone',
      type: 'text',
      label: '联系电话',
      placeholder: '请输入手机号',
      validation: {
        required: '请输入联系电话',
        pattern: { value: '^1[3-9]\\d{9}$', message: '请输入有效的手机号' },
      },
      layout: { colSpan: 6 },
    },
    {
      name: 'email',
      type: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      layout: { colSpan: 6 },
    },
  ],
};

/**
 * 简单的反馈表单 Schema
 */
export const feedbackSchema: FormSchema = {
  id: 'feedback',
  title: '意见反馈',
  description: '请告诉我们您的想法',
  fields: [
    {
      name: 'category',
      type: 'select',
      label: '反馈类型',
      options: [
        { label: '功能建议', value: 'feature' },
        { label: 'Bug 反馈', value: 'bug' },
        { label: '使用咨询', value: 'question' },
        { label: '其他', value: 'other' },
      ],
      validation: { required: '请选择反馈类型' },
      layout: { colSpan: 6 },
    },
    {
      name: 'priority',
      type: 'radio',
      label: '紧急程度',
      options: [
        { label: '紧急', value: 'urgent' },
        { label: '一般', value: 'normal' },
        { label: '不急', value: 'low' },
      ],
      defaultValue: 'normal',
      layout: { colSpan: 6 },
    },
    {
      name: 'content',
      type: 'textarea',
      label: '详细描述',
      placeholder: '请详细描述您的问题或建议...',
      validation: {
        required: '请输入反馈内容',
        minLength: { value: 10, message: '请至少输入10个字符' },
      },
      layout: { colSpan: 12 },
    },
    {
      name: 'contact',
      type: 'text',
      label: '联系方式',
      placeholder: '手机号或邮箱（选填）',
      layout: { colSpan: 12 },
    },
  ],
  submit: {
    text: '提交反馈',
  },
};

/**
 * 产品配置表单 Schema（带复杂联动）
 */
export const productConfigSchema: FormSchema = {
  id: 'product-config',
  title: '产品配置',
  fields: [
    {
      name: 'productType',
      type: 'select',
      label: '产品类型',
      options: [
        { label: '寿险', value: 'life' },
        { label: '医疗险', value: 'medical' },
        { label: '意外险', value: 'accident' },
      ],
      validation: { required: '请选择产品类型' },
      layout: { colSpan: 6 },
    },
    {
      name: 'coverage',
      type: 'number',
      label: '保额（万元）',
      placeholder: '请输入保额',
      validation: {
        required: '请输入保额',
        min: { value: 1, message: '保额至少1万' },
      },
      layout: { colSpan: 6 },
    },
    // 只有寿险显示
    {
      name: 'paymentYears',
      type: 'select',
      label: '缴费年限',
      options: [
        { label: '趸交', value: 1 },
        { label: '5年', value: 5 },
        { label: '10年', value: 10 },
        { label: '20年', value: 20 },
      ],
      layout: { colSpan: 6 },
      dependencies: [{ field: 'productType', condition: 'equals', value: 'life', action: 'show' }],
    },
    // 只有医疗险显示
    {
      name: 'deductible',
      type: 'select',
      label: '免赔额',
      options: [
        { label: '0元', value: 0 },
        { label: '1万元', value: 10000 },
        { label: '2万元', value: 20000 },
      ],
      layout: { colSpan: 6 },
      dependencies: [
        { field: 'productType', condition: 'equals', value: 'medical', action: 'show' },
      ],
    },
    {
      name: 'addRiders',
      type: 'switch',
      label: '添加附加险',
      defaultValue: false,
      layout: { colSpan: 12 },
    },
    // 附加险选择（开关打开时显示）
    {
      name: 'riders',
      type: 'checkbox',
      label: '选择附加险',
      options: [
        { label: '意外医疗', value: 'accident_medical' },
        { label: '住院津贴', value: 'hospital_allowance' },
        { label: '豁免保费', value: 'waiver' },
      ],
      layout: { colSpan: 12 },
      dependencies: [{ field: 'addRiders', condition: 'equals', value: true, action: 'show' }],
    },
  ],
};
