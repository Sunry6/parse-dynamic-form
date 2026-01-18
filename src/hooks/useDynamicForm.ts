import { api } from '@/lib/axios';
import type { FormSchema } from '@/types/dynamic-form';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

interface UseDynamicFormOptions {
  /** Schema API 地址 */
  schemaUrl?: string;
  /** 直接传入的 Schema */
  schema?: FormSchema;
  /** 初始值 API 地址 */
  initialValuesUrl?: string;
  /** 直接传入的初始值 */
  initialValues?: Record<string, unknown>;
  /** 提交 API 地址 */
  submitUrl?: string;
  /** 提交方法 */
  submitMethod?: 'POST' | 'PUT' | 'PATCH';
  /** 提交成功回调 */
  onSubmitSuccess?: (response: unknown) => void;
  /** 提交失败回调 */
  onSubmitError?: (error: Error) => void;
}

interface UseDynamicFormReturn {
  /** 表单 Schema */
  schema: FormSchema | undefined;
  /** 初始值 */
  defaultValues: Record<string, unknown> | undefined;
  /** Schema 加载状态 */
  isLoadingSchema: boolean;
  /** 初始值加载状态 */
  isLoadingValues: boolean;
  /** Schema 加载错误 */
  schemaError: Error | undefined;
  /** 初始值加载错误 */
  valuesError: Error | undefined;
  /** 提交状态 */
  isSubmitting: boolean;
  /** 提交错误 */
  submitError: Error | undefined;
  /** 提交表单 */
  submitForm: (data: Record<string, unknown>) => Promise<void>;
  /** 刷新 Schema */
  refreshSchema: () => void;
  /** 刷新初始值 */
  refreshValues: () => void;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

/**
 * 动态表单 Hook
 * 管理 Schema 获取、初始值获取和表单提交
 */
export function useDynamicForm(options: UseDynamicFormOptions): UseDynamicFormReturn {
  const {
    schemaUrl,
    schema: directSchema,
    initialValuesUrl,
    initialValues: directValues,
    submitUrl,
    submitMethod = 'POST',
    onSubmitSuccess,
    onSubmitError,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | undefined>();

  // 获取 Schema
  const {
    data: fetchedSchema,
    error: schemaError,
    isLoading: isLoadingSchema,
    mutate: refreshSchema,
  } = useSWR<FormSchema>(schemaUrl ? schemaUrl : null, fetcher, {
    revalidateOnFocus: false,
  });

  // 获取初始值
  const {
    data: fetchedValues,
    error: valuesError,
    isLoading: isLoadingValues,
    mutate: refreshValues,
  } = useSWR<Record<string, unknown>>(initialValuesUrl ? initialValuesUrl : null, fetcher, {
    revalidateOnFocus: false,
  });

  // 使用直接传入的 Schema 或从 API 获取的 Schema
  const schema = directSchema ?? fetchedSchema;
  const defaultValues = directValues ?? fetchedValues;

  // 提交表单
  const submitForm = useCallback(
    async (data: Record<string, unknown>) => {
      const url = submitUrl ?? schema?.submit?.url;
      if (!url) {
        console.warn('No submit URL provided');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(undefined);

      try {
        const method = schema?.submit?.method ?? submitMethod;
        let response;

        switch (method) {
          case 'PUT':
            response = await api.put(url, data);
            break;
          case 'PATCH':
            response = await api.patch(url, data);
            break;
          default:
            response = await api.post(url, data);
        }

        onSubmitSuccess?.(response.data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('提交失败');
        setSubmitError(error);
        onSubmitError?.(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitUrl, schema, submitMethod, onSubmitSuccess, onSubmitError]
  );

  return {
    schema,
    defaultValues,
    isLoadingSchema,
    isLoadingValues,
    schemaError,
    valuesError,
    isSubmitting,
    submitError,
    submitForm,
    refreshSchema: () => refreshSchema(),
    refreshValues: () => refreshValues(),
  };
}
