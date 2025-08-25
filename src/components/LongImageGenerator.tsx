'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface ArticleRecord {
  slug: string;
  title: string;
  content: string;
  markdown: string;
  url: string;
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

  const generateLongImage = async () => {
    if (!imageRef.current) return;

    setGenerating(true);
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
      setGeneratedImage(imageDataUrl);
    } catch (error) {
      console.error('生成长图失败:', error);
      alert('生成长图失败，请稍后重试');
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

  const shareToTwitter = () => {
    if (!generatedImage) return;

    // 将图片转换为blob然后分享
    const text = encodeURIComponent(`📄 "${article.title}" - 通过文章转载工具生成 ${window.location.origin}${article.url}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    if (!generatedImage) return;

    const url = encodeURIComponent(`${window.location.origin}${article.url}`);
    const title = encodeURIComponent(article.title);
    const summary = encodeURIComponent('通过文章转载工具生成的精美长图');
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getCardStyles = () => {
    switch (selectedTheme) {
      case 'dark':
        return 'bg-gray-800 border-gray-700';
      case 'gradient':
        return 'bg-white/80 backdrop-blur border-white/20 shadow-xl';
      default:
        return 'bg-white border-gray-200 shadow-lg';
    }
  };

  // 简化HTML内容，移除复杂标签
  const getCleanContent = (htmlContent: string) => {
    // 提取纯文本内容，保留基本格式
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

      {/* 生成按钮 */}
      <div className="flex space-x-4">
        <button
          onClick={generateLongImage}
          disabled={generating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? '生成中...' : '🖼️ 生成长图'}
        </button>
      </div>

      {/* 隐藏的长图模板 */}
      <div 
        ref={imageRef}
        className={`fixed -left-[9999px] w-[800px] min-h-screen p-12 ${getThemeStyles()}`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <div className={`rounded-2xl border-2 p-8 ${getCardStyles()}`}>
          {/* 标题部分 */}
          <div className="text-center mb-8 border-b pb-6" 
               style={{ borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex justify-center items-center space-x-4 text-sm opacity-75">
              <span>📅 {new Date(article.savedAt).toLocaleDateString('zh-CN')}</span>
              <span>•</span>
              <span>📄 文章转载工具</span>
            </div>
          </div>

          {/* 内容部分 */}
          <div className="text-lg leading-relaxed space-y-4">
            {getCleanContent(article.content)
              .split('\n\n')
              .slice(0, 15) // 限制段落数量
              .map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph.trim()}
                </p>
              ))}
          </div>

          {/* 底部标识 */}
          <div className="mt-8 pt-6 border-t text-center text-sm opacity-60"
               style={{ borderColor: selectedTheme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <p>由文章转载工具生成 • {window.location.origin}</p>
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