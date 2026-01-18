import type { ComponentRegistry } from '@/types/component-registry';
import { createContext, useContext, type ReactNode } from 'react';
import { shadcnRegistry } from './adapters/shadcn-adapter';

/**
 * 组件注册表 Context
 * 用于在组件树中传递组件注册表
 */
const ComponentRegistryContext = createContext<ComponentRegistry>(shadcnRegistry);

/**
 * 组件注册表 Provider
 * 包裹在应用顶层，提供自定义组件
 */
export function ComponentRegistryProvider({
  registry,
  children,
}: {
  registry: ComponentRegistry;
  children: ReactNode;
}) {
  return (
    <ComponentRegistryContext.Provider value={registry}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}

/**
 * 获取组件注册表的 Hook
 */
export function useComponentRegistry(): ComponentRegistry {
  return useContext(ComponentRegistryContext);
}

/**
 * 获取单个组件的 Hook
 */
export function useComponent<K extends keyof ComponentRegistry>(name: K): ComponentRegistry[K] {
  const registry = useComponentRegistry();
  return registry[name];
}
