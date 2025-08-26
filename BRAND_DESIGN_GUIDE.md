# 🎨 ShareX AI - Brand Design Guide

## 🎯 品牌定位
**AI 超级分享平台** - 智能化内容分享与跨平台传播解决方案

### 核心关键词分析
- **Share** → 分享、传播、连接
- **X** → 任意平台、无限可能（∞）、跨界融合
- **AI & 平台感** → 智能化、现代、简洁

## 🚀 Logo 设计方案

### 方案一：文字标志（Primary Wordmark）
```
ShareX AI
```

**设计要点：**
- **字体选择**: Inter / SF Pro Display (几何无衬线)
- **Share**: 标准字重，体现分享的普适性
- **X**: 特殊设计处理
  - 方向一: 多向箭头样式 (→↑↓←)
  - 方向二: 无限符号变形 (∞)
  - 方向三: 渐变扩散效果
- **AI**: 轻量级副标题字体

### 方案二：图标标志（Icon Mark）

#### 设计元素组合
1. **扩散箭头网络**
   ```
   中心圆点 + 多方向扩散箭头
   寓意：一键分享至多平台
   ```

2. **智能对话气泡**
   ```
   对话气泡 + 向外箭头 + AI符号
   寓意：智能内容转化与分享
   ```

3. **无限连接网格**
   ```
   点阵网络 + 无限符号
   寓意：无界限的平台互联
   ```

## 🎨 配色系统

### 主色调 (Primary Colors)
```css
/* 科技蓝 - 智能 & 信任 */
--primary-blue: #2D9CDB;
--primary-blue-light: #5BB3E8;
--primary-blue-dark: #1E7AA6;

/* 活力橙 - 传播 & 增长 */
--accent-orange: #FF7B54;
--accent-orange-light: #FF9B7A;
--accent-orange-dark: #E65A35;
```

### 辅助色 (Secondary Colors)
```css
/* 中性灰 - 平衡 & 简洁 */
--neutral-light: #F8F9FA;
--neutral-medium: #E9ECEF;
--neutral-dark: #6C757D;
--neutral-black: #343A40;

/* 功能色 */
--success: #28A745;
--warning: #FFC107;
--danger: #DC3545;
--info: #17A2B8;
```

### 渐变组合
```css
/* 主渐变 - 科技感 */
--gradient-primary: linear-gradient(135deg, #2D9CDB 0%, #5BB3E8 100%);

/* 活力渐变 - 传播感 */
--gradient-accent: linear-gradient(135deg, #FF7B54 0%, #FF9B7A 100%);

/* 多彩渐变 - 跨平台感 */
--gradient-multi: linear-gradient(135deg, #2D9CDB 0%, #FF7B54 50%, #28A745 100%);
```

## 📐 Logo 应用规范

### 尺寸规范
```
最小使用尺寸：
- 横版Logo：宽度不小于120px
- 图标Logo：不小于24px × 24px
- Favicon：16px, 32px, 48px 版本

标准尺寸：
- 网页头部：180px × 48px
- 应用图标：512px × 512px
- 社交媒体：400px × 400px
```

### 安全距离
```
Logo周围保持 = Logo高度 × 0.5 的空白距离
```

### 使用场景

#### 1. 网页应用
```html
<!-- 主导航栏 -->
<div class="logo-primary">
  <img src="/logo-horizontal.svg" alt="ShareX AI">
</div>

<!-- Favicon -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

#### 2. 移动应用
```
App图标：渐变背景 + 白色图标
启动页：深色背景 + Logo动画
```

#### 3. 营销物料
```
商务名片：横版Logo + 联系信息
宣传册：大尺寸Logo + 品牌色彩
```

## 🎭 品牌视觉元素

### 图形语言
```
几何形状：圆形、箭头、网格
线条风格：2-3px 粗细，圆角处理
图标风格：线性图标，统一风格
插画风格：扁平化，渐变色彩
```

### 动画效果
```css
/* Logo入场动画 */
.logo-enter {
  animation: fadeInUp 0.6s ease-out;
}

/* 分享按钮动画 */
.share-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(45, 156, 219, 0.3);
  transition: all 0.3s ease;
}

/* 箭头扩散动画 */
.share-arrows {
  animation: pulse-spread 2s infinite;
}
```

## 📱 应用示例

### 网页头部设计
```html
<header class="brand-header">
  <div class="logo-container">
    <svg class="logo-icon">
      <!-- 动态箭头图标 -->
    </svg>
    <h1 class="logo-text">ShareX<span class="ai-badge">AI</span></h1>
  </div>
  <nav class="main-nav">
    <!-- 导航菜单 -->
  </nav>
</header>
```

### 分享按钮设计
```html
<button class="share-btn primary">
  <svg class="share-icon">
    <!-- 多向箭头图标 -->
  </svg>
  <span>智能分享</span>
  <div class="ripple-effect"></div>
</button>
```

### 平台图标网格
```html
<div class="platform-grid">
  <div class="platform-item" data-platform="twitter">
    <div class="platform-icon twitter"></div>
    <span>Twitter</span>
  </div>
  <!-- 其他平台... -->
</div>
```

## 🖼️ Logo 变体

### 1. 标准版本 (Standard)
- 完整Logo：ShareX AI
- 使用场景：官网头部、正式文档

### 2. 紧凑版本 (Compact)
- 简化Logo：ShareX
- 使用场景：移动端、小尺寸应用

### 3. 图标版本 (Icon Only)
- 纯图标：多向箭头/无限符号
- 使用场景：Favicon、App图标、按钮

### 4. 反色版本 (Inverted)
- 深色背景适配版本
- 白色文字 + 蓝橙渐变图标

### 5. 单色版本 (Monochrome)
- 黑白版本，用于特殊场景
- 保持图形识别度

## 🎪 品牌应用场景

### 数字场景
```
官方网站、移动APP、浏览器插件
社交媒体、电子邮件、数字广告
在线文档、API文档、开发者页面
```

### 线下场景
```
商务名片、公司标识、展会物料
产品包装、宣传册、户外广告
工作服装、办公用品、礼品定制
```

## 📊 品牌一致性检查清单

### ✅ Logo 使用规范
- [ ] 使用官方提供的Logo文件
- [ ] 遵守最小尺寸要求
- [ ] 保持安全距离
- [ ] 使用标准配色
- [ ] 避免变形和拉伸

### ✅ 色彩应用规范
- [ ] 主色调正确使用
- [ ] 渐变效果规范
- [ ] 对比度符合无障碍标准
- [ ] 印刷色彩准确

### ✅ 字体应用规范
- [ ] 标题使用品牌字体
- [ ] 正文字体易读性良好
- [ ] 字号层级清晰
- [ ] 行间距合理

这套品牌设计系统将为ShareX AI平台提供专业、现代、智能的视觉识别，突出"AI超级分享平台"的核心定位，体现跨平台、智能化的品牌特色。