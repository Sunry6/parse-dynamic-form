# React Best Practices for AI Agents

## 抽象

这份React和Next.js应用的性能优化指南专为AI代理和LLM设计。包含8个类别的40+规则，按影响级别排序，从关键级（消除瀑布流、减小bundle大小）到渐进级（高级模式）。每个规则都包含详细解释、真实示例对比错误与正确的实现，以及具体的影响指标，用于指导自动化重构和代码生成。

## 目录

1. **消除瀑布流 — 关键级**
2. **Bundle Size 优化 — 关键级**
3. **服务端性能 — 高级**
4. **客户端数据获取 — 中高级**
5. **重新渲染优化 — 中级**
6. **渲染性能 — 中级**
7. **JavaScript性能 — 中低级**
8. **高级模式 — 低级**

---

## 1. 消除瀑布流 — 关键级

瀑布流是第一性能杀手。每个顺序await都增加完整的网络延迟。消除它们能带来最大收益。

### 1.1 延迟await直到需要时

影响级别: 高 (避免阻塞未使用的代码路径)

将`await`操作移动到实际使用它们的分支中，避免阻塞不需要它们的代码路径。

```javascript
// ❌ 错误: 阻塞两个分支
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // 立即返回但仍然等待了userData
    return { skipped: true }
  }

  // 只有这个分支使用userData
  return processUserData(userData)
}

// ✅ 正确: 只在需要时阻塞
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // 无需等待立即返回
    return { skipped: true }
  }

  // 只在需要时获取
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

### 1.2 基于依赖的并行化

影响级别: 关键 (2-10倍改进)

对于具有部分依赖关系的操作，使用`better-all`来最大化并行性。它会在最早可能的时刻自动开始每个任务。

```javascript
// ❌ 错误: profile不必要地等待config
const [user, config] = await Promise.all([fetchUser(), fetchConfig()]);
const profile = await fetchProfile(user.id);

// ✅ 正确: config和profile并行运行
import { all } from 'better-all';

const { user, config, profile } = await all({
  async user() {
    return fetchUser();
  },
  async config() {
    return fetchConfig();
  },
  async profile() {
    return fetchProfile((await this.$.user).id);
  },
});
```

### 1.3 独立操作使用Promise.all()

影响级别: 关键 (2-10倍改进)

当异步操作没有相互依赖时，使用`Promise.all()`并发执行。

```javascript
// ❌ 错误: 顺序执行，3次网络往返
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// ✅ 正确: 并行执行，1次网络往返
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()]);
```

### 1.4 策略性Suspense边界

影响级别: 高 (更快的初始绘制)

不要在async组件中await数据后返回JSX，而是使用Suspense边界在数据加载时更快显示包装器UI。

```javascript
// ❌ 错误: 包装器被数据获取阻塞
async function Page() {
  const data = await fetchData(); // 阻塞整个页面

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  );
}

// ✅ 正确: 包装器立即显示，数据流入
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  );
}

async function DataDisplay() {
  const data = await fetchData(); // 只阻塞这个组件
  return <div>{data.content}</div>;
}
```

---

## 2. Bundle Size 优化 — 关键级

减小初始bundle大小改善交互时间(TTI)和最大内容绘制(LCP)。

### 2.1 避免Barrel文件导入

影响级别: 关键 (200-800ms导入成本，构建变慢)

直接从源文件导入而不是barrel文件，避免加载数千个未使用的模块。

```javascript
// ❌ 错误: 导入整个库
import { Check, X, Menu } from 'lucide-react';
// 加载1,583个模块，开发环境额外耗时~2.8秒
// 运行时成本: 每次冷启动200-800ms

import { Button, TextField } from '@mui/material';
// 加载2,225个模块，开发环境额外耗时~4.2秒

// ✅ 正确: 只导入所需内容
import Check from 'lucide-react/dist/esm/icons/check';
import X from 'lucide-react/dist/esm/icons/x';
import Menu from 'lucide-react/dist/esm/icons/menu';
// 只加载3个模块(~2KB vs ~1MB)

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// 替代方案: Next.js 13.5+
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
};

// 然后可以保持人性化的barrel导入:
import { Check, X, Menu } from 'lucide-react';
// 在构建时自动转换为直接导入
```

### 2.2 重组件动态导入

影响级别: 关键 (直接影响TTI和LCP)

使用`next/dynamic`懒加载初始渲染不需要的大型组件。

```javascript
// ❌ 错误: Monaco与主chunk打包~300KB
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}

// ✅ 正确: Monaco按需加载
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

### 2.3 基于用户意图的预加载

影响级别: 中 (减少感知延迟)

在需要重bundles之前预加载它们以减少感知延迟。

```javascript
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

---

## 3. 服务端性能 — 高级

优化服务端渲染和数据获取消除服务端瀑布流并减少响应时间。

### 3.1 跨请求LRU缓存

影响级别: 高 (跨请求缓存)

`React.cache()`只在一个请求内工作。对于在顺序请求间共享的数据，使用LRU缓存。

```javascript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5分钟
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

### 3.2 最小化RSC边界的序列化

影响级别: 高 (减少数据传输大小)

React Server/Client边界将所有对象属性序列化为字符串并嵌入HTML响应中。只传递客户端实际使用的字段。

```javascript
// ❌ 错误: 序列化所有50个字段
async function Page() {
  const user = await fetchUser()  // 50个字段
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // 只使用1个字段
}

// ✅ 正确: 只序列化1个字段
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

### 3.3 组件组合并行数据获取

影响级别: 关键 (消除服务端瀑布流)

React Server Components在树内顺序执行。通过组合重构以并行化数据获取。

```javascript
// ❌ 错误: Sidebar等待Page的获取完成
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

// ✅ 正确: 两者同时获取
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

### 3.4 React.cache()的请求内去重

影响级别: 中 (请求内去重)

在服务端使用`React.cache()`进行请求去重。认证和数据库查询受益最多。

```javascript
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return await db.user.findUnique({
    where: { id: session.user.id },
  });
});
// 在单个请求内，对getCurrentUser()的多次调用只执行一次查询
```

---

## 4. 客户端数据获取 — 中高级

自动去重和高效数据获取模式减少冗余网络请求。

### 4.1 SWR自动去重

影响级别: 中高 (自动去重)

SWR启用请求去重、缓存和跨组件实例的重新验证。

```javascript
// ❌ 错误: 无去重，每个实例都获取
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then(setUsers);
  }, []);
}

// ✅ 正确: 多个实例共享一个请求
import useSWR from 'swr';

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher);
}

// 对于不可变数据:
import { useImmutableSWR } from '@/lib/swr';

function StaticContent() {
  const { data } = useImmutableSWR('/api/config', fetcher);
}

// 对于数据变更:
import { useSWRMutation } from 'swr/mutation';

function UpdateButton() {
  const { trigger } = useSWRMutation('/api/user', updateUser);
  return <button onClick={() => trigger()}>Update</button>;
}
```

---

## 5. 重新渲染优化 — 中级

减少不必要的重新渲染最小化浪费的计算并改善UI响应性。

### 5.1 提取到记忆化组件

影响级别: 中 (启用早期返回)

将昂贵的工作提取到记忆化组件中，在计算前启用早期返回。

```javascript
// ❌ 错误: 即使在loading时也计算avatar
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}

// ✅ 正确: loading时跳过计算
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

注意: 如果项目启用了[React Compiler](https://react.dev/learn/react-compiler)，不需要手动使用`memo()`和`useMemo()`进行记忆化。

### 5.2 函数式setState更新

影响级别: 中 (防止过期闭包和不必要的回调重建)

基于当前状态值更新状态时，使用setState的函数更新形式而不是直接引用状态变量。

```javascript
// ❌ 错误: 需要state作为依赖
function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])  // ❌ items依赖导致重建

  const removeItem = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id))
  }, [])  // ❌ 缺少items依赖 - 会使用过期的items!

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}

// ✅ 正确: 稳定回调，无过期闭包
function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems(curr => [...curr, ...newItems])
  }, [])  // ✅ 无需依赖

  const removeItem = useCallback((id: string) => {
    setItems(curr => curr.filter(item => item.id !== id))
  }, [])  // ✅ 安全且稳定

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

### 5.3 惰性状态初始化

影响级别: 中 (每次渲染的浪费计算)

为昂贵的初始值传递函数给`useState`。没有函数形式，初始化程序在每次渲染时运行，即使值只使用一次。

```javascript
// ❌ 错误: 每次渲染都运行
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()在每次渲染时运行，即使在初始化后
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')

  return <SearchResults index={searchIndex} query={query} />
}

// ✅ 正确: 只运行一次
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()只在初始渲染时运行
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')

  return <SearchResults index={searchIndex} query={query} />
}
```

---

## 6. 渲染性能 — 中级

优化渲染过程减少浏览器需要做的工作。

### 6.1 显式条件渲染

影响级别: 低 (防止渲染0或NaN)

对于可以是`0`、`NaN`或其他会渲染的假值的条件，使用显式三元运算符(`? :`)而不是`&&`进行条件渲染。

```javascript
// ❌ 错误: count为0时渲染"0"
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count && <span className="badge">{count}</span>}
    </div>
  )
}
// count = 0时，渲染: <div>0</div>
// count = 5时，渲染: <div><span class="badge">5</span></div>

// ✅ 正确: count为0时不渲染
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </div>
  )
}
// count = 0时，渲染: <div></div>
// count = 5时，渲染: <div><span class="badge">5</span></div>
```

### 6.2 长列表的CSS content-visibility

影响级别: 高 (更快的初始渲染)

应用`content-visibility: auto`来延迟离屏渲染。

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

```javascript
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="overflow-y-auto h-screen">
      {messages.map(msg => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

对于1000条消息，浏览器跳过约990个离屏项目的布局/绘制(初始渲染快10倍)。

### 6.3 提升静态JSX元素

影响级别: 低 (避免重建)

将静态JSX提取到组件外以避免重建。

```javascript
// ❌ 错误: 每次渲染都重建元素
function LoadingSkeleton() {
  return <div className="h-20 animate-pulse bg-gray-200" />;
}

function Container() {
  return <div>{loading && <LoadingSkeleton />}</div>;
}

// ✅ 正确: 重用同一元素
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />;

function Container() {
  return <div>{loading && loadingSkeleton}</div>;
}
```

注意: 如果启用了[React Compiler](https://react.dev/learn/react-compiler)，编译器会自动提升静态JSX元素，无需手动提升。

---

## 7. JavaScript性能 — 中低级

热路径的微优化可以累积成有意义的改进。

### 7.1 为重复查找构建索引映射

影响级别: 中低 (1M操作到2K操作)

同一键的多个`.find()`调用应使用Map。

```javascript
// ❌ 错误: 每次查找O(n)
function processOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId)
  }))
}

// ✅ 正确: 每次查找O(1)
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map(u => [u.id, u]))

  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId)
  }))
}
// 构建映射一次(O(n))，然后所有查找都是O(1)
// 1000订单 × 1000用户: 1M操作 → 2K操作
```

### 7.2 缓存重复函数调用

影响级别: 中 (避免冗余计算)

当同一函数在渲染期间用相同输入重复调用时，使用模块级Map缓存函数结果。

```javascript
// ❌ 错误: 冗余计算
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // 对相同项目名称slugify()被调用100+次
        const slug = slugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}

// ✅ 正确: 缓存结果
// 模块级缓存
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // 每个唯一项目名称只计算一次
        const slug = cachedSlugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

### 7.3 使用toSorted()而不是sort()保持不变性

影响级别: 中高 (防止React状态中的变异错误)

`.sort()`就地变异数组，这可能导致React状态和props的错误。使用`.toSorted()`创建新的排序数组而不变异。

```javascript
// ❌ 错误: 变异原数组
function UserList({ users }: { users: User[] }) {
  // 变异users prop数组!
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}

// ✅ 正确: 创建新数组
function UserList({ users }: { users: User[] }) {
  // 创建新的排序数组，原数组不变
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

### 7.4 使用Set/Map进行O(1)查找

影响级别: 中低 (O(n)到O(1))

将数组转换为Set/Map进行重复成员检查。

```javascript
// ❌ 错误: 每次检查O(n)
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))

// ✅ 正确: 每次检查O(1)
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

---

## 8. 高级模式 — 低级

需要仔细实现的特定情况的高级模式。

### 8.1 在Refs中存储事件处理器

影响级别: 低 (稳定订阅)

在不应因回调更改而重新订阅的effects中使用回调时，将回调存储在refs中。

```javascript
// ❌ 错误: 每次渲染都重新订阅
function useWindowEvent(event: string, handler: () => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}

// ✅ 正确: 稳定订阅
function useWindowEvent(event: string, handler: () => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = () => handlerRef.current()
    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}

// 替代方案: 如果使用最新React，使用useEffectEvent
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: () => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

---

## 参考资料

1. [React官方文档](https://react.dev/)
2. [Next.js官方文档](https://nextjs.org/)
3. [SWR官方文档](https://swr.vercel.app/)
4. [better-all](https://github.com/shuding/better-all)
5. [LRU Cache](https://github.com/isaacs/node-lru-cache)
6. [Next.js包导入优化](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
7. [Vercel Dashboard性能优化](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

---

> **注意**: 这份文档主要供代理和LLM在维护、生成或重构Vercel的React和Next.js代码库时遵循。人类也可能觉得有用，但这里的指导针对AI辅助工作流的自动化和一致性进行了优化。
