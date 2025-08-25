'use client';

import { useState, useMemo } from 'react';
import ArticleForm from '@/components/ArticleForm';
import ArticlePreview from '@/components/ArticlePreview';
import ArticleShareModal from '@/components/ArticleShareModal';
import { ArticleData } from '@/lib/scraper';
import { MarketingData } from '@/components/MarketingInfo';

export default function Home() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleScrape = async (url: string, marketingData?: MarketingData) => {
    setLoading(true);
    setError(null);
    setSaved(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, marketingData }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('主页 - 收到的文章数据:', {
          title: result.data.title,
          hasMarketingData: !!result.data.marketingData,
          marketingData: result.data.marketingData
        });
        
        setArticle(result.data);
        // 文章抓取成功后，自动显示分享对话框
        setTimeout(() => setShowShareModal(true), 500);
      } else {
        setError(result.error || '抓取失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData: ArticleData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();

      if (result.success) {
        // 文章已保存到服务器，直接使用返回的URL
        setSaved({
          path: `服务端存储`,
          url: result.data.url
        });
        setArticle(null);
      } else {
        setError(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setArticle(null);
    setError(null);
    setSaved(null);
    setShowShareModal(false);
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
  };

  // 预生成bookmarklet代码避免重复渲染
  const bookmarkletCode = useMemo(() => {
    return `javascript:(function(){
      try {
        var title = document.title || 'Untitled';
        var url = window.location.href;
        var description = '';
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          description = metaDesc.getAttribute('content') || '';
        }
        
        // 防止重复创建弹窗
        var existingPopup = document.getElementById('share-popup-bookmarklet');
        if (existingPopup) {
          existingPopup.remove();
        }
        
        // 创建弹窗
        var popup = document.createElement('div');
        popup.id = 'share-popup-bookmarklet';
        popup.style.cssText = 'position:fixed;top:20px;right:20px;width:350px;background:#fff;border:2px solid #007AFF;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:999999;font-family:system-ui,-apple-system,sans-serif;';
        
        // 构建HTML内容
        var htmlContent = '<div style="padding:20px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">' +
            '<h3 style="margin:0;color:#1f2937;font-size:16px;font-weight:600;">📤 一键转发</h3>' +
            '<button id="closePopupBtn" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">×</button>' +
          '</div>' +
          '<div style="margin-bottom:15px;">' +
            '<div style="font-size:14px;color:#374151;font-weight:500;margin-bottom:8px;">📝 文章标题:</div>' +
            '<div style="font-size:13px;color:#6b7280;line-height:1.4;max-height:40px;overflow:hidden;">' + title + '</div>' +
          '</div>' +
          '<div style="margin-bottom:20px;">' +
            '<div style="font-size:14px;color:#374151;font-weight:500;margin-bottom:8px;">🔗 文章链接:</div>' +
            '<div style="font-size:12px;color:#6b7280;word-break:break-all;max-height:40px;overflow:hidden;">' + url + '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<a id="shareTwitterBtn" href="#" target="_blank" style="display:flex;align-items:center;justify-content:center;padding:10px;background:#1DA1F2;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:500;">' +
              '<span style="margin-right:6px;">🐦</span>X/Twitter' +
            '</a>' +
            '<a id="shareLinkedInBtn" href="#" target="_blank" style="display:flex;align-items:center;justify-content:center;padding:10px;background:#0077B5;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:500;">' +
              '<span style="margin-right:6px;">💼</span>LinkedIn' +
            '</a>' +
          '</div>' +
          '<div style="margin-top:15px;text-align:center;">' +
            '<a href="#" id="toolLinkBtn" style="font-size:12px;color:#6b7280;text-decoration:none;cursor:pointer;">转载工具 →</a>' +
          '</div>' +
        '</div>';
        
        popup.innerHTML = htmlContent;
        document.body.appendChild(popup);
        
        // 设置分享链接
        var twitterText = encodeURIComponent('📄 推荐阅读: ' + title + ' ' + url);
        var linkedInText = encodeURIComponent(title);
        var linkedInUrl = encodeURIComponent(url);
        
        var twitterBtn = document.getElementById('shareTwitterBtn');
        var linkedInBtn = document.getElementById('shareLinkedInBtn');
        var closeBtn = document.getElementById('closePopupBtn');
        var toolBtn = document.getElementById('toolLinkBtn');
        
        if (twitterBtn) {
          twitterBtn.href = 'https://twitter.com/intent/tweet?text=' + twitterText;
        }
        
        if (linkedInBtn) {
          linkedInBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + linkedInUrl + '&title=' + linkedInText;
        }
        
        // 关闭按钮事件
        if (closeBtn) {
          closeBtn.onclick = function(e) {
            e.preventDefault();
            if (document.body.contains(popup)) {
              document.body.removeChild(popup);
            }
          };
        }
        
        // 工具链接事件
        if (toolBtn) {
          toolBtn.onclick = function(e) {
            e.preventDefault();
            var toolUrl = 'https://sharetox.com';
            window.open(toolUrl, '_blank');
          };
        }
        
        // 10秒后自动关闭
        setTimeout(function() {
          if (document.body.contains(popup)) {
            document.body.removeChild(popup);
          }
        }, 10000);
        
      } catch (error) {
        alert('一键转发工具出现错误: ' + error.message);
        console.error('Bookmarklet error:', error);
      }
    })();`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <div className="text-6xl font-bold text-gray-900 mb-6">
            SharetoX ✨
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent mb-4">
            一键转发助手
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            一键转发网页/内容，生成自主品牌长图和网页，分享至社交媒体，赢得更多获客机会！
          </p>
        </header>

        {error && (
          <div className="mb-8 bg-red-50/70 border border-red-200/60 rounded-xl p-4 max-w-4xl mx-auto">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  ❌ 处理失败
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800 mb-3">
                  🎉 文章保存成功！
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">本地文件：</span> 
                      <code className="bg-green-100 px-2 py-1 rounded font-mono text-xs">{saved.path}</code>
                    </p>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">在线访问：</span></p>
                    <div className="mt-1 flex items-center space-x-3">
                      <a
                        href={saved.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        查看文章
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + saved.url);
                          alert('链接已复制到剪贴板！');
                        }}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制链接
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      链接地址: <code className="bg-green-100 px-1 py-0.5 rounded font-mono">{window.location.origin + saved.url}</code>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-200">
                  <button
                    onClick={handleReset}
                    className="text-sm text-green-800 hover:text-green-900 font-medium underline transition-colors duration-200"
                  >
                    继续转载更多文章 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!article && !saved && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 左侧：网址表单 - 2/3 宽度 */}
            <div className="lg:col-span-2">
              <div className="w-full">
                <ArticleForm onSubmit={handleScrape} loading={loading} />
              </div>
            </div>
            
            {/* 右侧：一键转发书签工具 - 1/3 宽度 */}
            <div className="lg:col-span-1">
              <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">🔖 一键转发书签</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    拖拽下方按钮到浏览器书签栏，在任何网页上都能一键转发文章到社交媒体
                  </p>
                  
                  
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => {
                        // 创建bookmarklet链接并复制到剪贴板
                        navigator.clipboard.writeText(bookmarkletCode).then(() => {
                          alert('书签代码已复制到剪贴板！\n\n请按以下步骤操作：\n1. 在浏览器中添加新书签\n2. 将剪贴板内容粘贴为书签地址\n3. 保存书签\n4. 在任意网页点击书签即可使用');
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 cursor-pointer text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      🔖 一键转发
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="flex items-start">
                        <span className="font-medium mr-1">1.</span>
                        <span>拖拽按钮到书签栏</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium mr-1">2.</span>
                        <span>在文章页面点击书签</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium mr-1">3.</span>
                        <span>选择平台一键分享</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {article && !showShareModal && (
          <ArticlePreview
            article={article}
            onSave={handleSave}
            onEdit={handleReset}
            loading={loading}
          />
        )}
      </div>

      {/* 文章分享对话框 */}
      {article && (
        <ArticleShareModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          article={article}
        />
      )}
    </div>
  );
}
