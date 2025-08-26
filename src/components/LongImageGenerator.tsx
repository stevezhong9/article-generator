'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { MarketingData } from './MarketingInfo';

interface ArticleRecord {
  slug: string;
  title: string;
  content: string;
  markdown: string;
  url: string;
  author?: string;
  publishDate?: string;
  description?: string;
  sourceUrl?: string;
  marketingData?: MarketingData | null;
  savedAt: string;
}

interface LongImageGeneratorProps {
  article: ArticleRecord;
}

export default function LongImageGenerator({ article }: LongImageGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'gradient'>('light');

  // 调试：打印文章数据
  console.log('LongImageGenerator - article data:', {
    title: article.title,
    hasMarketingData: !!article.marketingData,
    marketingData: article.marketingData
  });

  const generateLongImage = async () => {
    if (!imageRef.current) {
      alert('图片容器未找到，请刷新页面重试');
      return;
    }

    setGenerating(true);
    console.log('开始生成长图...');
    
    try {
      // 创建更高质量的canvas
      const canvas = await html2canvas(imageRef.current, {
        scale: 2, // 高清图片
        width: 800,
        height: imageRef.current.scrollHeight,
        useCORS: true,
        backgroundColor: selectedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
      });

      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('长图生成成功，数据长度:', imageDataUrl.length);
      setGeneratedImage(imageDataUrl);
      
      // 显示成功消息
      alert('🎉 长图生成成功！请向下滚动查看生成的图片和分享选项。');
      
    } catch (error) {
      console.error('生成长图失败:', error);
      alert(`生成长图失败: ${error instanceof Error ? error.message : '未知错误'}。请检查浏览器控制台获取详细信息。`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.download = `${article.slug}-long-image.png`;
    link.href = generatedImage;
    link.click();
  };

  const shareToTwitter = async () => {
    if (!generatedImage) return;

    try {
      // 生成包含文章数据的分享链接
      const shareableURL = generateShareableURL();
      
      // 检查是否支持 Web Share API（移动设备）
      if (navigator.share && navigator.canShare) {
        // 将base64图片转换为blob
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `${article.slug}-image.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: article.title,
            text: `📄 "${article.title}" - 通过SharetoX生成`,
            url: shareableURL,
            files: [file]
          });
          return;
        }
      }
      
      // 桌面端：提供多种分享选项
      showShareOptions('twitter', shareableURL);
      
    } catch (error) {
      console.error('分享失败:', error);
      // 回退到简单文本分享
      const text = encodeURIComponent(`📄 "${article.title}" - 通过SharetoX生成 ${window.location.origin}${article.url}`);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  };

  const shareToLinkedIn = async () => {
    if (!generatedImage) return;

    try {
      const shareableURL = generateShareableURL();
      
      // LinkedIn 不支持直接图片分享，提供下载提示
      showShareOptions('linkedin', shareableURL);
      
    } catch (error) {
      console.error('分享失败:', error);
      // 回退到简单链接分享
      const url = encodeURIComponent(`${window.location.origin}${article.url}`);
      const title = encodeURIComponent(article.title);
      const summary = encodeURIComponent('通过SharetoX生成的精美长图');
      
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=400');
    }
  };

  // 生成包含文章数据的可分享URL
  const generateShareableURL = () => {
    try {
      // 压缩文章数据
      const shareData = {
        title: article.title,
        content: getCleanContent(article.content).substring(0, 1000), // 限制长度
        savedAt: article.savedAt,
        slug: article.slug
      };
      
      // Base64编码
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
      return `${window.location.origin}/${article.slug}?data=${encoded}`;
    } catch (error) {
      console.error('生成分享链接失败:', error);
      return `${window.location.origin}${article.url}`;
    }
  };

  // 显示分享选项对话框
  const showShareOptions = (platform: 'twitter' | 'linkedin', url: string) => {
    const message = platform === 'twitter' 
      ? `🐦 Twitter/X 分享选项：\n\n1. 复制图片：右键保存上面的长图\n2. 发推文：手动上传图片并粘贴链接\n\n链接已复制到剪贴板！`
      : `💼 LinkedIn 分享选项：\n\n1. 下载图片：点击下载按钮保存图片\n2. 发帖：在LinkedIn手动上传图片并粘贴链接\n\n链接已复制到剪贴板！`;
    
    navigator.clipboard.writeText(url);
    alert(message);
  };


  // 处理HTML内容并添加内联样式
  const getStyledContent = (htmlContent: string, theme: 'light' | 'dark' | 'gradient') => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // 移除不适合长图的元素
    const mediaElements = tempDiv.querySelectorAll('img, video, iframe, script, style');
    mediaElements.forEach(el => el.remove());
    
    // 基础颜色配置
    const colors = {
      text: theme === 'dark' ? '#e5e7eb' : '#333333',
      heading: theme === 'dark' ? '#ffffff' : '#1f2937',
      link: theme === 'dark' ? '#60a5fa' : '#007AFF',
      border: theme === 'dark' ? '#374151' : '#e5e7eb'
    };
    
    // 样式化所有元素
    const styleElement = (element: Element, styles: string) => {
      element.setAttribute('style', styles);
    };
    
    // 段落样式
    tempDiv.querySelectorAll('p').forEach(p => {
      styleElement(p, `
        margin-bottom: 1.2em;
        line-height: 1.8;
        font-size: 18px;
        color: ${colors.text};
        text-align: justify;
      `);
    });
    
    // 标题样式
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      const level = parseInt(h.tagName.charAt(1));
      const fontSize = Math.max(24 - (level - 1) * 2, 18);
      styleElement(h, `
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        font-weight: 600;
        line-height: 1.4;
        color: ${colors.heading};
        font-size: ${fontSize}px;
        ${level === 2 ? `border-left: 4px solid ${colors.link}; padding-left: 10px;` : ''}
      `);
    });
    
    // 列表样式
    tempDiv.querySelectorAll('ul, ol').forEach(list => {
      styleElement(list, `
        margin: 1.2em 0;
        padding-left: 2em;
        color: ${colors.text};
      `);
    });
    
    tempDiv.querySelectorAll('li').forEach(li => {
      styleElement(li, `
        margin-bottom: 0.5em;
        line-height: 1.7;
        font-size: 18px;
      `);
    });
    
    // 链接样式
    tempDiv.querySelectorAll('a').forEach(a => {
      styleElement(a, `
        color: ${colors.link};
        text-decoration: none;
        border-bottom: 1px solid transparent;
      `);
    });
    
    // 引用样式
    tempDiv.querySelectorAll('blockquote').forEach(quote => {
      styleElement(quote, `
        margin: 1.5em 0;
        padding: 1em 1.2em;
        background: ${theme === 'dark' ? '#1f2937' : '#f8f9fa'};
        border-left: 4px solid ${colors.link};
        border-radius: 0 4px 4px 0;
        font-style: italic;
        color: ${colors.text};
      `);
    });
    
    // 代码样式
    tempDiv.querySelectorAll('code').forEach(code => {
      styleElement(code, `
        background: ${theme === 'dark' ? '#374151' : '#f1f3f4'};
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 16px;
      `);
    });
    
    tempDiv.querySelectorAll('pre').forEach(pre => {
      styleElement(pre, `
        background: ${theme === 'dark' ? '#1f2937' : '#f8f9fa'};
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1.5em 0;
        border: 1px solid ${colors.border};
      `);
    });
    
    // 强调样式
    tempDiv.querySelectorAll('strong, b').forEach(strong => {
      styleElement(strong, `
        font-weight: 600;
        color: ${colors.heading};
      `);
    });
    
    tempDiv.querySelectorAll('em, i').forEach(em => {
      styleElement(em, `
        font-style: italic;
        color: ${theme === 'dark' ? '#9ca3af' : '#7f8c8d'};
      `);
    });
    
    // 分割线样式
    tempDiv.querySelectorAll('hr').forEach(hr => {
      styleElement(hr, `
        margin: 2em 0;
        border: none;
        height: 1px;
        background: linear-gradient(to right, transparent, ${colors.border}, transparent);
      `);
    });
    
    // 设置整个容器的基础样式
    tempDiv.setAttribute('style', `
      font-size: 18px;
      line-height: 1.8;
      color: ${colors.text};
      max-height: 800px;
      overflow: hidden;
      position: relative;
    `);
    
    return tempDiv.innerHTML;
  };

  // 简化HTML内容，移除复杂标签（保留用于分享URL）
  const getCleanContent = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // 移除所有的img标签和其他媒体内容
    const imgs = tempDiv.querySelectorAll('img, video, iframe, script, style');
    imgs.forEach(el => el.remove());
    
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <div className="space-y-6">
      {/* 主题选择 */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">选择主题:</span>
        <div className="flex space-x-2">
          {[
            { value: 'light', label: '浅色', preview: 'bg-white border-gray-300' },
            { value: 'dark', label: '深色', preview: 'bg-gray-900 border-gray-600' },
            { value: 'gradient', label: '渐变', preview: 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300' }
          ].map(theme => (
            <button
              key={theme.value}
              onClick={() => setSelectedTheme(theme.value as 'light' | 'dark' | 'gradient')}
              className={`px-3 py-1 text-sm rounded-md border-2 transition-all ${
                selectedTheme === theme.value 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded mb-1 mx-auto ${theme.preview}`}></div>
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮和状态 */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={generateLongImage}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? '⏳ 生成中...' : '🖼️ 生成长图'}
          </button>
        </div>

        {/* 状态提示 */}
        {!generatedImage && !generating && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 选择主题后点击&quot;生成长图&quot;按钮，生成后将显示下载和社交媒体分享选项。
            </p>
          </div>
        )}

        {generating && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ⏳ 正在生成长图，请稍候...
            </p>
          </div>
        )}
      </div>

      {/* 隐藏的长图模板 - 使用内联样式避免 lab() 颜色函数 */}
      <div 
        ref={imageRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          width: '800px',
          minHeight: '100vh',
          padding: '48px',
          backgroundColor: selectedTheme === 'dark' ? '#1a1a1a' : selectedTheme === 'gradient' ? '#f8fafc' : '#ffffff',
          color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div 
          style={{
            borderRadius: '16px',
            border: '2px solid',
            borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb',
            padding: '32px',
            backgroundColor: selectedTheme === 'dark' ? '#1f2937' : selectedTheme === 'gradient' ? 'rgba(255,255,255,0.9)' : '#ffffff',
            boxShadow: selectedTheme === 'gradient' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* 顶部品牌Logo区域 - 根据营销信息显示 */}
          {article.marketingData && (article.marketingData.logo || article.marketingData.companyName || article.marketingData.website || article.marketingData.email) && (
            <div 
              style={{
                textAlign: 'center',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid',
                borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              {/* Logo */}
              {article.marketingData.logo && (
                <img 
                  src={article.marketingData.logo} 
                  alt="Brand Logo"
                  style={{
                    height: '60px',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    marginBottom: '12px',
                    display: 'block',
                    margin: '0 auto 12px auto'
                  }}
                />
              )}
              
              {/* 公司名称 */}
              {article.marketingData.companyName && (
                <div 
                  style={{
                    fontSize: '18px',
                    color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                >
                  {article.marketingData.companyName}
                </div>
              )}
              
              {/* 网址和邮箱 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                fontSize: '14px',
                flexWrap: 'wrap'
              }}>
                {article.marketingData.website && (
                  <div style={{ 
                    color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🌐 {article.marketingData.website}
                  </div>
                )}
                
                {article.marketingData.website && article.marketingData.email && (
                  <span style={{ color: selectedTheme === 'dark' ? '#4b5563' : '#d1d5db' }}>|</span>
                )}
                
                {article.marketingData.email && (
                  <div style={{ 
                    color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📧 {article.marketingData.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 标题部分 */}
          <div 
            style={{
              textAlign: 'center',
              marginBottom: '32px',
              borderBottom: '1px solid',
              borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb',
              paddingBottom: '24px'
            }}
          >
            <h1 
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.2',
                color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937'
              }}
            >
              {article.title}
            </h1>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '14px',
                opacity: 0.75,
                gap: '16px'
              }}
            >
              <span>📅 {new Date(article.savedAt).toLocaleDateString('zh-CN')}</span>
              <span>•</span>
              <span>📄 {article.marketingData?.companyName || 'SharetoX'}</span>
            </div>
          </div>

          {/* 内容部分 - 使用HTML内容并应用样式 */}
          <div 
            dangerouslySetInnerHTML={{ 
              __html: getStyledContent(article.content, selectedTheme) 
            }}
          />

          {/* 转载来源 - 显示营销信息和原文链接 */}
          {(article.sourceUrl || article.marketingData) && (
            <div 
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid',
                borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb',
                textAlign: 'center'
              }}
            >
              <div 
                style={{
                  backgroundColor: selectedTheme === 'dark' ? '#1f2937' : '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                {/* 转载信息标题 */}
                <h4 
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937'
                  }}
                >
                  📄 转载信息
                </h4>
                
                {/* 营销推广信息 */}
                {article.marketingData && (article.marketingData.companyName || article.marketingData.website) && (
                  <div style={{
                    backgroundColor: selectedTheme === 'dark' ? '#374151' : '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedTheme === 'dark' ? '#4b5563' : '#e5e7eb',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: selectedTheme === 'dark' ? '#d1d5db' : '#374151'
                    }}>
                      🏢 转载方信息
                    </div>
                    
                    {article.marketingData.companyName && (
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {article.marketingData.companyName}
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px',
                      flexWrap: 'wrap'
                    }}>
                      {article.marketingData.website && (
                        <div style={{ 
                          color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🌐 官网: {article.marketingData.website}
                        </div>
                      )}
                      
                      {article.marketingData.website && article.marketingData.email && (
                        <span style={{ color: selectedTheme === 'dark' ? '#4b5563' : '#d1d5db' }}>|</span>
                      )}
                      
                      {article.marketingData.email && (
                        <div style={{ 
                          color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          📧 邮箱: {article.marketingData.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 原文链接 */}
                {article.sourceUrl && (
                  <div>
                    <p 
                      style={{
                        fontSize: '12px',
                        marginBottom: '8px',
                        color: selectedTheme === 'dark' ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      本文转载自原作者，版权归原作者所有
                    </p>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: selectedTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        原文链接: 
                      </span>
                      <span 
                        style={{ 
                          color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF',
                          wordBreak: 'break-all'
                        }}
                      >
                        {article.sourceUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 联系方式区域 */}
          {article.marketingData && (
            <div 
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid',
                borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb',
                textAlign: 'center'
              }}
            >
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937'
                }}
              >
                联系我们
              </h3>
              
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: selectedTheme === 'dark' ? '#d1d5db' : '#4b5563'
                }}
              >
                {article.marketingData.website && (
                  <div>
                    <span style={{ fontWeight: '500' }}>官网: </span>
                    <span style={{ color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF' }}>
                      {article.marketingData.website}
                    </span>
                  </div>
                )}
                
                {(article.marketingData.email || article.marketingData.phone) && (
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '24px',
                      marginTop: '8px'
                    }}
                  >
                    {article.marketingData.email && (
                      <div>
                        <span style={{ fontWeight: '500' }}>邮箱: </span>
                        <span style={{ color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF' }}>
                          {article.marketingData.email}
                        </span>
                      </div>
                    )}
                    
                    {article.marketingData.phone && (
                      <div>
                        <span style={{ fontWeight: '500' }}>电话: </span>
                        <span style={{ color: selectedTheme === 'dark' ? '#60a5fa' : '#007AFF' }}>
                          {article.marketingData.phone}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 底部标识 */}
          <div 
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid',
              borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb',
              textAlign: 'center',
              fontSize: '12px',
              opacity: 0.5
            }}
          >
            <p>由{article.marketingData?.companyName || 'SharetoX'}生成 • {typeof window !== 'undefined' ? window.location.origin : ''}</p>
          </div>
        </div>
      </div>

      {/* 生成的图片预览和操作 */}
      {generatedImage && (
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">✨ 长图生成成功！</h3>
          
          {/* 图片预览 */}
          <div className="mb-6">
            <img 
              src={generatedImage} 
              alt="Generated long image"
              className="max-w-full h-auto border border-gray-300 rounded-lg shadow-md"
              style={{ maxHeight: '400px' }}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadImage}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              下载图片
            </button>

            <button
              onClick={shareToTwitter}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              分享到 X
            </button>

            <button
              onClick={shareToLinkedIn}
              className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              分享到 LinkedIn
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>提示:</strong> 长图已生成！您可以下载保存到本地，或直接分享到社交媒体平台。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}