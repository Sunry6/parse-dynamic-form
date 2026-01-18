import { DynamicFormRenderer } from '@/components/forms/DynamicFormRenderer';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { setListMap } from '@/hooks/useFieldOptions';
import { cn } from '@/lib/utils';
import type { FormSchema } from '@/types/dynamic-form';
import { useEffect, useState } from 'react';

/**
 * 初始化 sessionStorage 中的 listMap（模拟从后端获取的数据字典）
 * 实际项目中这个数据会在登录后从后端获取并保存到 sessionStorage
 */
function initMockListMap() {
  const listMap = {
    // 简单列表：职业选项
    occupations: [
      { label: '公务员', value: 'civil_servant' },
      { label: '企业员工', value: 'employee' },
      { label: '自由职业', value: 'freelancer' },
      { label: '学生', value: 'student' },
      { label: '其他', value: 'other' },
    ],
    // 简单列表：证件类型
    idTypes: [
      { label: '身份证', value: 'idCard' },
      { label: '护照', value: 'passport' },
      { label: '营业执照', value: 'businessLicense' },
    ],
    // 级联列表：省份
    provinces: [
      { label: '北京市', value: 'BJ' },
      { label: '上海市', value: 'SH' },
      { label: '广东省', value: 'GD' },
      { label: '浙江省', value: 'ZJ' },
    ],
    // 级联列表：城市（根据省份筛选）
    cities: {
      BJ: [
        { label: '东城区', value: 'BJ_DC' },
        { label: '西城区', value: 'BJ_XC' },
        { label: '朝阳区', value: 'BJ_CY' },
        { label: '海淀区', value: 'BJ_HD' },
      ],
      SH: [
        { label: '黄浦区', value: 'SH_HP' },
        { label: '静安区', value: 'SH_JA' },
        { label: '徐汇区', value: 'SH_XH' },
        { label: '浦东新区', value: 'SH_PD' },
      ],
      GD: [
        { label: '广州市', value: 'GD_GZ' },
        { label: '深圳市', value: 'GD_SZ' },
        { label: '东莞市', value: 'GD_DG' },
        { label: '佛山市', value: 'GD_FS' },
      ],
      ZJ: [
        { label: '杭州市', value: 'ZJ_HZ' },
        { label: '宁波市', value: 'ZJ_NB' },
        { label: '温州市', value: 'ZJ_WZ' },
        { label: '嘉兴市', value: 'ZJ_JX' },
      ],
    },
    // 受益人与投保人关系
    relationships: [
      { label: '配偶', value: 'spouse' },
      { label: '子女', value: 'child' },
      { label: '父母', value: 'parent' },
      { label: '其他', value: 'other' },
    ],
  };

  setListMap(listMap);
}

/**
 * 示例：核保（UW）系统动态表单 Schema
 * 实际项目中这个 Schema 会从后端 API 获取
 */
const mockUWFormSchema: FormSchema = {
  id: 'uw-form-001',
  version: '1.0.0',
  title: '投保人信息',
  description: '请填写投保人的基本信息，带 * 的为必填项',
  layout: {
    columns: 2,
    labelPosition: 'top',
  },
  fields: [
    // 基本信息
    {
      name: 'applicantType',
      type: 'radio',
      label: '投保人类型',
      options: [
        { label: '个人', value: 'individual' },
        { label: '企业', value: 'company' },
      ],
      defaultValue: 'individual',
      validation: { required: '请选择投保人类型' },
      layout: { colSpan: 12 },
    },
    {
      name: 'name',
      type: 'text',
      label: '姓名/企业名称',
      placeholder: '请输入姓名或企业名称',
      validation: {
        required: '请输入姓名或企业名称',
        minLength: { value: 2, message: '至少输入2个字符' },
      },
      layout: { colSpan: 6 },
    },
    {
      name: 'idType',
      type: 'select',
      label: '证件类型',
      placeholder: '请选择证件类型',
      options: [
        { label: '身份证', value: 'idCard' },
        { label: '护照', value: 'passport' },
        { label: '营业执照', value: 'businessLicense' },
      ],
      validation: { required: '请选择证件类型' },
      layout: { colSpan: 6 },
      // 联动：企业类型时只显示营业执照
      dependencies: [
        {
          field: 'applicantType',
          condition: 'equals',
          value: 'company',
          action: 'show',
        },
      ],
    },
    {
      name: 'idNumber',
      type: 'text',
      label: '证件号码',
      placeholder: '请输入证件号码',
      validation: {
        required: '请输入证件号码',
        pattern: {
          value: '^[A-Za-z0-9]+$',
          message: '证件号码只能包含字母和数字',
        },
      },
      layout: { colSpan: 6 },
    },
    {
      name: 'phone',
      type: 'text',
      label: '联系电话',
      placeholder: '请输入手机号码',
      validation: {
        required: '请输入联系电话',
        pattern: {
          value: '^1[3-9]\\d{9}$',
          message: '请输入有效的手机号码',
        },
      },
      layout: { colSpan: 6 },
    },
    {
      name: 'email',
      type: 'email',
      label: '电子邮箱',
      placeholder: '请输入电子邮箱',
      validation: {
        email: '请输入有效的邮箱地址',
      },
      layout: { colSpan: 6 },
    },
    {
      name: 'birthDate',
      type: 'date',
      label: '出生日期',
      validation: { required: '请选择出生日期' },
      layout: { colSpan: 6 },
      // 联动：仅个人显示
      dependencies: [
        {
          field: 'applicantType',
          condition: 'equals',
          value: 'individual',
          action: 'show',
        },
      ],
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
      // 联动：仅个人显示
      dependencies: [
        {
          field: 'applicantType',
          condition: 'equals',
          value: 'individual',
          action: 'show',
        },
      ],
    },

    // 职业信息 - 仅个人显示（从 listMap 加载选项）
    {
      name: 'occupation',
      type: 'select',
      label: '职业',
      placeholder: '请选择职业',
      // 使用 optionsKey 从 sessionStorage 的 listMap 获取选项
      optionsKey: 'occupations',
      layout: { colSpan: 6 },
      dependencies: [
        {
          field: 'applicantType',
          condition: 'equals',
          value: 'individual',
          action: 'show',
        },
      ],
    },
    {
      name: 'occupationDetail',
      type: 'text',
      label: '职业详情',
      placeholder: '请描述具体职业',
      layout: { colSpan: 6 },
      // 联动：选择"其他"职业时才显示
      dependencies: [
        {
          field: 'occupation',
          condition: 'equals',
          value: 'other',
          action: 'show',
        },
      ],
    },

    // 省市级联选择示例（从 listMap 加载）
    {
      name: 'province',
      type: 'select',
      label: '省份',
      placeholder: '请选择省份',
      optionsKey: 'provinces',
      layout: { colSpan: 6 },
    },
    {
      name: 'city',
      type: 'select',
      label: '城市',
      placeholder: '请先选择省份',
      // 级联加载：根据 province 的值从 listMap.cities 获取对应城市
      optionsKey: 'cities',
      optionsDependsOn: ['province'],
      layout: { colSpan: 6 },
    },

    // 年收入
    {
      name: 'annualIncome',
      type: 'number',
      label: '年收入（万元）',
      placeholder: '请输入年收入',
      validation: {
        min: { value: 0, message: '年收入不能小于0' },
        max: { value: 99999, message: '年收入不能超过99999万' },
      },
      layout: { colSpan: 6 },
    },

    // 是否有社保
    {
      name: 'hasSocialSecurity',
      type: 'switch',
      label: '是否有社保',
      defaultValue: false,
      layout: { colSpan: 6 },
    },

    // 地址信息
    {
      name: 'address',
      type: 'textarea',
      label: '详细地址',
      placeholder: '请输入详细地址',
      validation: {
        required: '请输入详细地址',
        maxLength: { value: 200, message: '地址不能超过200个字符' },
      },
      layout: { colSpan: 12 },
    },

    // 受益人信息 - 数组字段示例
    {
      name: 'beneficiaries',
      type: 'array',
      label: '受益人信息',
      description: '可添加多个受益人，受益比例总和应为100%',
      minItems: 1,
      maxItems: 5,
      layout: { colSpan: 12 },
      children: [
        {
          name: 'beneficiaryName',
          type: 'text',
          label: '受益人姓名',
          placeholder: '请输入受益人姓名',
          validation: { required: '请输入受益人姓名' },
          layout: { colSpan: 4 },
        },
        {
          name: 'relationship',
          type: 'select',
          label: '与投保人关系',
          // 从 listMap 加载关系选项
          optionsKey: 'relationships',
          validation: { required: '请选择关系' },
          layout: { colSpan: 4 },
        },
        {
          name: 'benefitRatio',
          type: 'number',
          label: '受益比例(%)',
          placeholder: '1-100',
          validation: {
            required: '请输入受益比例',
            min: { value: 1, message: '最小1%' },
            max: { value: 100, message: '最大100%' },
          },
          layout: { colSpan: 4 },
        },
      ],
    },

    // 健康告知
    {
      name: 'healthDeclaration',
      type: 'checkbox',
      label: '健康告知',
      options: [
        { label: '过去两年内是否住院或手术', value: 'hospitalized' },
        { label: '是否患有慢性疾病', value: 'chronic_disease' },
        { label: '是否有家族遗传病史', value: 'genetic_history' },
        { label: '是否吸烟', value: 'smoking' },
      ],
      layout: { colSpan: 12 },
    },

    // 协议确认
    {
      name: 'agreeTerms',
      type: 'checkbox',
      label: '我已阅读并同意《投保须知》和《保险条款》',
      validation: { required: '请同意相关条款' },
      layout: { colSpan: 12 },
    },
  ],
  submit: {
    text: '提交投保申请',
    url: '/api/underwriting/submit',
    method: 'POST',
  },
};

export function DynamicForm() {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  // 初始化 listMap（实际项目中这一步在登录后完成）
  useEffect(() => {
    initMockListMap();
  }, []);

  // 使用 useDynamicForm hook
  // 实际项目中可以通过 schemaUrl 从 API 获取 Schema
  const {
    schema,
    isSubmitting,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    submitForm: _submitForm,
  } = useDynamicForm({
    // schemaUrl: '/api/underwriting/schema', // 实际项目中使用
    schema: mockUWFormSchema, // 示例使用静态 Schema
    onSubmitSuccess: (response) => {
      console.log('提交成功:', response);
    },
    onSubmitError: (error) => {
      console.error('提交失败:', error);
    },
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log('表单数据:', data);
    setSubmittedData(data);
    // 实际项目中调用 submitForm(data) 提交到后端
    // await submitForm(data);
  };

  const handleChange = (data: Record<string, unknown>) => {
    // 可以在这里处理表单值变化，比如实时保存草稿
    console.log('表单值变化:', data);
  };

  if (!schema) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className={cn('container mx-auto max-w-4xl px-4 py-8')}>
      <DynamicFormRenderer
        schema={schema}
        defaultValues={{
          applicantType: 'individual',
          beneficiaries: [{ beneficiaryName: '', relationship: '', benefitRatio: 100 }],
        }}
        onSubmit={handleSubmit}
        onChange={handleChange}
        loading={isSubmitting}
      />

      {/* 显示提交的数据（仅用于演示） */}
      {submittedData && (
        <div className="mt-8 rounded-lg border bg-muted p-4">
          <h3 className="mb-2 font-medium">已提交的数据：</h3>
          <pre className="overflow-auto text-sm">{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
