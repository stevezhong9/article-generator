'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { ArticleData } from '@/lib/scraper';

interface ArticleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleData;
}

type ThemeType = 'light' | 'dark' | 'gradient';

export default function ArticleShareModal({ isOpen, onClose, article }: ArticleShareModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('light');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // 调试：打印文章数据
  console.log('ArticleShareModal - article data:', {
    title: article.title,
    hasMarketingData: !!article.marketingData,
    marketingData: article.marketingData
  });

  const generateLongImage = useCallback(async () => {
    if (!imageRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(imageRef.current, {
        scale: 2,
        width: 800,
        height: imageRef.current.scrollHeight,
        useCORS: true,
        backgroundColor: selectedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
      });

      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      setGeneratedImage(imageDataUrl);
    } catch (error) {
      console.error('生成长图失败:', error);
    } finally {
      setGenerating(false);
    }
  }, [selectedTheme]);

  // 自动生成长图（使用默认主题）
  useEffect(() => {
    if (isOpen && article && !generatedImage) {
      // 延迟1秒自动生成，给UI一点时间渲染
      setTimeout(() => {
        generateLongImage();
      }, 1000);
    }
  }, [isOpen, article, generatedImage, generateLongImage]);

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `${article.finalSlug || article.slug}-long-image.png`;
    link.href = generatedImage;
    link.click();
  };


  const shareToTwitter = () => {
    // 使用带时间戳的完整URL
    const articleURL = `${window.location.origin}/${article.finalSlug || article.slug}`;
    
    // 构建推文内容
    const tweetText = `📄 ${article.title}

🔗 查看完整文章：${articleURL}

#文章分享 #知识`;
    
    // 打开Twitter发帖界面
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterURL, '_blank', 'width=600,height=500');
    
    // 提示用户操作步骤
    setTimeout(() => {
      alert(`✅ Twitter/X 发帖窗口已打开！

📋 接下来的操作：
1. 🖼️ 点击图片图标，上传刚才下载的长图
2. 📝 推文文字已自动填写好
3. 📤 点击发布即可

💡 其他人点击链接就能在您的网站上看到完整文章！`);
    }, 1000);
  };

  const shareToLinkedIn = () => {
    // 使用带时间戳的完整URL
    const articleURL = `${window.location.origin}/${article.finalSlug || article.slug}`;
    
    // LinkedIn 分享参数
    const linkedInURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleURL)}`;
    window.open(linkedInURL, '_blank', 'width=600,height=500');
    
    // 提示用户操作步骤
    setTimeout(() => {
      alert(`✅ LinkedIn 分享窗口已打开！

📋 接下来的操作：
1. 🖼️ 点击&ldquo;添加媒体&rdquo;按钮，上传刚才下载的长图
2. 📝 添加您的评论和见解
3. 🔗 文章链接已自动添加
4. 📤 点击发布即可

💡 其他人点击链接就能在您的网站上看到完整文章！`);
    }, 1000);
  };


  // 处理HTML内容并添加内联样式
  const getStyledContent = (htmlContent: string, theme: ThemeType) => {
    if (typeof document === 'undefined') return htmlContent;
    
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
    
    // 样式化段落
    tempDiv.querySelectorAll('p').forEach(p => {
      p.setAttribute('style', `
        margin-bottom: 1.2em;
        line-height: 1.8;
        font-size: 18px;
        color: ${colors.text};
        text-align: justify;
      `);
    });
    
    // 样式化标题
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      const level = parseInt(h.tagName.charAt(1));
      const fontSize = Math.max(24 - (level - 1) * 2, 18);
      h.setAttribute('style', `
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        font-weight: 600;
        line-height: 1.4;
        color: ${colors.heading};
        font-size: ${fontSize}px;
        ${level === 2 ? `border-left: 4px solid ${colors.link}; padding-left: 10px;` : ''}
      `);
    });
    
    // 样式化列表
    tempDiv.querySelectorAll('ul, ol').forEach(list => {
      list.setAttribute('style', `
        margin: 1.2em 0;
        padding-left: 2em;
        color: ${colors.text};
      `);
    });
    
    tempDiv.querySelectorAll('li').forEach(li => {
      li.setAttribute('style', `
        margin-bottom: 0.5em;
        line-height: 1.7;
        font-size: 18px;
      `);
    });
    
    // 样式化强调文本
    tempDiv.querySelectorAll('strong, b').forEach(strong => {
      strong.setAttribute('style', `
        font-weight: 600;
        color: ${colors.heading};
      `);
    });
    
    // 设置整个容器的基础样式
    tempDiv.setAttribute('style', `
      font-size: 18px;
      line-height: 1.8;
      color: ${colors.text};
      max-height: 800px;
      overflow: hidden;
    `);
    
    return tempDiv.innerHTML;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* 对话框 */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* 头部 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📄 文章长图生成</h2>
                <p className="text-sm text-gray-600 mt-1">选择风格模板，生成精美长图并分享到社交媒体</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 文章信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
              <div className="text-sm text-gray-600">
                <span>📅 {new Date().toLocaleDateString('zh-CN')}</span>
                <span className="mx-2">•</span>
                <span>🔗 {article.url}</span>
              </div>
            </div>

            {/* 主题选择 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎨 选择风格模板：</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: '经典白', preview: 'bg-white border-gray-300', description: '简洁大方' },
                  { value: 'dark', label: '深色', preview: 'bg-gray-900 border-gray-600', description: '酷炫专业' },
                  { value: 'gradient', label: '渐变', preview: 'bg-gradient-to-br from-blue-50 to-purple-100 border-blue-300', description: '现代时尚' }
                ].map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => {
                      setSelectedTheme(theme.value as ThemeType);
                      setGeneratedImage(null); // 重置图片以触发重新生成
                      setTimeout(generateLongImage, 100);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedTheme === theme.value 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg mb-2 ${theme.preview}`}></div>
                    <div className="font-medium text-gray-900">{theme.label}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成状态 */}
            {generating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-blue-800 font-medium">🎨 正在生成精美长图...</p>
              </div>
            )}

            {/* 长图预览 */}
            {generatedImage && (
              <div className="space-y-6">
                <h4 className="font-medium text-gray-900">📱 长图预览：</h4>
                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  <img 
                    src={generatedImage} 
                    alt="Generated long image"
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    style={{ maxHeight: '400px' }}
                  />
                </div>

                {/* 操作步骤提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">🚀 分享到社交媒体：</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><span className="font-medium">步骤 1：</span>点击&ldquo;下载图片&rdquo;保存长图到本地</p>
                    <p><span className="font-medium">步骤 2：</span>点击社交媒体按钮，自动打开发帖界面</p>
                    <p><span className="font-medium">步骤 3：</span>上传刚下载的图片，发布帖子</p>
                  </div>
                </div>

                {/* 分享按钮 */}
                <div className="space-y-4">
                  {/* 下载按钮 */}
                  <button
                    onClick={downloadImage}
                    className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    📁 下载长图到本地
                  </button>

                  {/* 社交媒体分享按钮 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center justify-center px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      🐦 分享到 Twitter/X
                    </button>

                    <button
                      onClick={shareToLinkedIn}
                      className="flex items-center justify-center px-6 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      💼 分享到 LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 底部提示 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                💡 <strong>重要提醒：</strong> 点击社交媒体按钮会直接打开发帖界面，文章标题和链接已自动填写。您只需上传长图并发布即可！其他人点击链接就能在您的网站查看完整文章。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 隐藏的长图模板 */}
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
          {/* 顶部品牌Logo区域 */}
          {article.marketingData?.logo && (
            <div 
              style={{
                textAlign: 'center',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid',
                borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <img 
                src={article.marketingData.logo} 
                alt="Brand Logo"
                style={{
                  height: '60px',
                  maxWidth: '200px',
                  objectFit: 'contain',
                  marginBottom: article.marketingData.companyName ? '12px' : '0',
                  display: 'block',
                  margin: '0 auto ' + (article.marketingData.companyName ? '12px' : '0') + ' auto'
                }}
              />
              {article.marketingData.companyName && (
                <div 
                  style={{
                    fontSize: '16px',
                    color: selectedTheme === 'dark' ? '#9ca3af' : '#6b7280',
                    fontWeight: '500'
                  }}
                >
                  {article.marketingData.companyName}
                </div>
              )}
            </div>
          )}

          {/* 标题部分 */}
          <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid', borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb', paddingBottom: '24px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2', color: selectedTheme === 'dark' ? '#ffffff' : '#1f2937' }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', opacity: 0.75, gap: '16px' }}>
              <span>📅 {new Date().toLocaleDateString('zh-CN')}</span>
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

          {/* 转载来源 */}
          {article.url && (
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
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <h4 
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: selectedTheme === 'dark' ? '#d1d5db' : '#374151'
                  }}
                >
                  📄 转载来源
                </h4>
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
                    {article.url}
                  </span>
                </div>
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
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid', borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb', textAlign: 'center', fontSize: '12px', opacity: 0.5 }}>
            <p>由{article.marketingData?.companyName || 'SharetoX'}生成 • {typeof window !== 'undefined' ? window.location.origin : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}