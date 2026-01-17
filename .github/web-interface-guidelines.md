# Web Interface Guidelines for AI Agents

这些规则用于检查Web界面代码的Vercel Web Interface Guidelines合规性。

## 无障碍访问 (Accessibility)

- **仅图标按钮**需要`aria-label`
- **表单控件**需要`<label>`或`aria-label`
- **交互元素**需要键盘处理器(`onKeyDown`/`onKeyUp`)
- 操作使用`<button>`，导航使用`<a>`/`<Link>`(不要用`<div onClick>`)
- **图片**需要`alt`(装饰性图片用`alt=""`)
- **装饰性图标**需要`aria-hidden="true"`
- **异步更新**(toast、验证)需要`aria-live="polite"`
- 在使用ARIA之前使用语义HTML(`<button>`, `<a>`, `<label>`, `<table>`)
- **标题层次化**`<h1>`–`<h6>`；包含主内容的跳转链接
- 标题锚点使用`scroll-margin-top`

## 焦点状态 (Focus States)

- **交互元素**需要可见焦点：`focus-visible:ring-*`或等效样式
- 绝不使用`outline-none` / `outline: none`而不提供焦点替代
- 使用`:focus-visible`而不是`:focus`(避免点击时的焦点环)
- 复合控件使用`:focus-within`进行群组焦点

## 表单 (Forms)

- **输入**需要`autocomplete`和有意义的`name`
- 使用正确的`type`(`email`, `tel`, `url`, `number`)和`inputmode`
- 绝不阻止粘贴(`onPaste` + `preventDefault`)
- **标签可点击**(`htmlFor`或包装控件)
- 在邮箱、代码、用户名上禁用拼写检查(`spellCheck={false}`)
- **复选框/单选按钮**：标签+控件共享单个点击目标(无死区)
- **提交按钮**在请求开始前保持启用；请求期间显示加载器
- **字段旁的内联错误**；提交时聚焦到第一个错误
- **占位符**以`…`结尾并显示示例模式
- 非认证字段使用`autocomplete="off"`避免密码管理器触发
- 未保存更改前导航时警告(`beforeunload`或路由守卫)

## 动画 (Animation)

- **遵循**`prefers-reduced-motion`(提供简化变体或禁用)
- **只动画**`transform`/`opacity`(对合成器友好)
- 绝不使用`transition: all`—明确列出属性
- 设置正确的`transform-origin`
- **SVG**：在`<g>`包装器上使用transforms，配合`transform-box: fill-box; transform-origin: center`
- **动画可中断**—在动画中途响应用户输入

## 排版 (Typography)

- `…`而不是`...`
- 使用弯引号`"` `"`而不是直引号`"`
- **不间断空格**：`10&nbsp;MB`, `⌘&nbsp;K`, 品牌名
- **加载状态**以`…`结尾：`"Loading…"`, `"Saving…"`
- 数字列/比较使用`font-variant-numeric: tabular-nums`
- 标题使用`text-wrap: balance`或`text-pretty`(防止孤行)

## 内容处理 (Content Handling)

- **文本容器**处理长内容：`truncate`, `line-clamp-*`, 或`break-words`
- **Flex子元素**需要`min-w-0`以允许文本截断
- **处理空状态**—不要为空字符串/数组渲染破损的UI
- **用户生成内容**：预期短、平均和很长的输入

## 图片 (Images)

- `<img>`需要明确的`width`和`height`(防止CLS)
- **折叠下方图片**：`loading="lazy"`
- **折叠上方关键图片**：`priority`或`fetchpriority="high"`

## 性能 (Performance)

- **大列表**(>50项)：虚拟化(`virtua`, `content-visibility: auto`)
- **渲染中无布局读取**(`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`)
- **批量DOM读写**；避免交错
- **偏好非控制输入**；控制输入必须对每次击键都很便宜
- 为CDN/资源域添加`<link rel="preconnect">`
- **关键字体**：`<link rel="preload" as="font">`配合`font-display: swap`

## 导航与状态 (Navigation & State)

- **URL反映状态**—查询参数中的过滤器、标签页、分页、展开面板
- **链接使用**`<a>`/`<Link>`(Cmd/Ctrl+点击、中键点击支持)
- **所有状态UI深链接**(如果使用`useState`，考虑通过nuqs或类似方式同步URL)
- **破坏性操作**需要确认模态或撤销窗口—绝不立即执行

## 触摸与交互 (Touch & Interaction)

- `touch-action: manipulation`(防止双击缩放延迟)
- 有意设置`-webkit-tap-highlight-color`
- 模态/抽屉/表单中的`overscroll-behavior: contain`
- **拖拽期间**：禁用文本选择，拖拽元素上的`inert`
- **稀疏使用**`autoFocus`—仅桌面端、单个主输入；避免在移动端使用

## 安全区域与布局 (Safe Areas & Layout)

- **全出血布局**需要`env(safe-area-inset-*)`处理刘海
- **避免不需要的滚动条**：容器上的`overflow-x-hidden`，修复内容溢出
- **布局使用Flex/grid**而不是JS测量

## 深色模式与主题 (Dark Mode & Theming)

- 深色主题的`<html>`上使用`color-scheme: dark`(修复滚动条、输入框)
- `<meta name="theme-color">`匹配页面背景
- **原生**`<select>`：明确的`background-color`和`color`(Windows深色模式)

## 本地化与国际化 (Locale & i18n)

- **日期/时间**：使用`Intl.DateTimeFormat`而不是硬编码格式
- **数字/货币**：使用`Intl.NumberFormat`而不是硬编码格式
- 通过`Accept-Language` / `navigator.languages`检测语言，不使用IP

## 水合安全 (Hydration Safety)

- 有`value`的**输入**需要`onChange`(或使用`defaultValue`作为非控制)
- **日期/时间渲染**：防范水合不匹配(服务器vs客户端)
- 只在真正需要时使用`suppressHydrationWarning`

## 悬停与交互状态 (Hover & Interactive States)

- **按钮/链接**需要`hover:`状态(视觉反馈)
- **交互状态**增加对比度：悬停/激活/聚焦比其余状态更突出

## 内容与文案 (Content & Copy)

- **主动语态**："Install the CLI"而不是"The CLI will be installed"
- **标题/按钮使用标题大小写**(芝加哥样式)
- **计数使用数字**："8 deployments"而不是"eight"
- **具体按钮标签**："Save API Key"而不是"Continue"
- **错误信息**包含修复/下一步，不仅仅是问题
- **第二人称**；避免第一人称
- 空间受限时`&`优于"and"

## 反模式 (Anti-patterns)

标记这些问题：

- 禁用缩放的`user-scalable=no`或`maximum-scale=1`
- 带`preventDefault`的`onPaste`
- `transition: all`
- 没有focus-visible替代的`outline-none`
- 没有`<a>`的内联`onClick`导航
- 带点击处理器的`<div>`或`<span>`(应该是`<button>`)
- 没有尺寸的图片
- 没有虚拟化的大数组`.map()`
- 没有标签的表单输入
- 没有`aria-label`的图标按钮
- 硬编码的日期/数字格式(使用`Intl.*`)
- 没有明确理由的`autoFocus`

## 输出格式

按文件分组。使用`file:line`格式(VS Code可点击)。简洁的发现。

```text
## src/Button.tsx

src/Button.tsx:42 - 图标按钮缺少aria-label
src/Button.tsx:18 - 输入缺少标签
src/Button.tsx:55 - 动画缺少prefers-reduced-motion
src/Button.tsx:67 - transition: all → 列出属性

## src/Modal.tsx

src/Modal.tsx:12 - 缺少overscroll-behavior: contain
src/Modal.tsx:34 - "..." → "…"

## src/Card.tsx

✓ 通过
```

指出问题+位置。除非修复方法不明显，否则跳过解释。无前言。

---

**使用说明**：检查这些文件的合规性：$ARGUMENTS

读取文件，对照下面的规则检查。输出简洁但全面—为了简洁牺牲语法。高信噪比。
