'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import Link from 'next/link';
import ArticleForm from '@/components/ArticleForm';
import { MarketingData } from '@/components/MarketingInfo';

export default function Home() {
  const { data: session, status } = useSession();
  const [showLoadingFallback, setShowLoadingFallback] = useState(false);

  // 如果超过1.5秒还在加载，显示内容而不是无限loading  
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setShowLoadingFallback(true);
      }, 1500); // 减少到1.5秒
      return () => clearTimeout(timer);
    }
  }, [status]);

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);
  const [initialUrl, setInitialUrl] = useState('');

  // 检查URL参数，用于书签工具
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam) {
      setInitialUrl(decodeURIComponent(urlParam));
    }
  }, []);

  // 处理文章提交
  const handleArticleSubmit = async (url: string, marketingData?: MarketingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setArticle(result.data);
        // 自动保存，包含营销信息
        setTimeout(async () => {
          try {
            const saveResponse = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...result.data,
                userId: session?.user?.id,
                username: session?.user?.username,
                marketingData // 包含营销推广信息
              })
            });
            const saveResult = await saveResponse.json();
            if (saveResult.success) {
              setSaved({
                path: saveResult.data.path,
                url: saveResult.data.url
              });
            }
          } catch (error) {
            console.error('保存失败:', error);
          }
        }, 1000);
      } else {
        setError(result.error || '抓取失败');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setArticle(null);
    setError(null);
    setSaved(null);
  };

  // 生成书签工具代码
  const generateBookmarklet = () => {
    const bookmarkletCode = `javascript:(function(){
      const currentUrl = window.location.href;
      const siteName = '${process.env.NEXT_PUBLIC_SITE_URL || 'https://sharetox.com'}';
      window.open(siteName + '?url=' + encodeURIComponent(currentUrl), '_blank', 'width=800,height=600');
    })();`;
    return bookmarkletCode;
  };

  // 如果正在加载且没有超时，显示简化的加载状态
  if (status === 'loading' && !showLoadingFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Logo size="lg" linkToHome={false} priority className="drop-shadow-2xl mb-4" />
            <p className="text-sm text-gray-500">一键转发文章，智能营销推广</p>
            <div className="flex items-center justify-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">正在加载用户信息...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" linkToHome={false} priority className="drop-shadow-2xl mb-4" />
          <p className="text-sm text-gray-500">一键转发文章，智能营销推广</p>
        </div>

        {/* User Status */}
        {session && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">{session.user?.name || session.user?.email}</p>
                <p className="text-sm text-gray-500">已登录</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/${session.user?.username || 'user'}`} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                我的文章
              </Link>
              <Link href="/profile" className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                个人资料
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                退出
              </button>
            </div>
          </div>
        )}

        {/* Login prompt */}
        {!session && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
            <h2 className="text-xl font-semibold mb-3">欢迎使用 ShareX AI</h2>
            <p className="text-gray-600 mb-4">请先登录以使用文章转载功能</p>
            <button
              onClick={async () => {
                try {
                  console.log('尝试Google登录...');
                  const result = await signIn('google', { 
                    callbackUrl: '/',
                    redirect: true 
                  });
                  console.log('登录结果:', result);
                } catch (error) {
                  console.error('登录错误:', error);
                  alert('登录过程出现错误: ' + (error as Error).message);
                }
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </button>
          </div>
        )}

        {/* 书签工具栏（对所有用户显示） */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">🔖</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">一键转发书签工具</h3>
              <p className="text-sm text-orange-700 mb-4">
                拖拽下方按钮到浏览器书签栏，在任意网页点击即可快速转发文章
              </p>
              
              <div className="flex items-center space-x-4">
                <a
                  href={generateBookmarklet()}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 cursor-move select-none"
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/html', `<a href="${generateBookmarklet()}">ShareX 一键转发</a>`);
                  }}
                >
                  🚀 ShareX 一键转发
                </a>
                
                <div className="text-sm text-gray-600">
                  ← 拖拽到书签栏
                </div>
              </div>
              
              <div className="mt-3 text-xs text-orange-600 bg-orange-100 p-2 rounded">
                💡 使用说明：将按钮拖拽到浏览器书签栏，在任意文章页面点击书签即可快速转发
              </div>
            </div>
          </div>
        </div>

        {/* 主要功能区域 */}
        {session && !article && (
          <div className="mb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            <ArticleForm 
              onSubmit={handleArticleSubmit} 
              loading={loading}
              initialUrl={initialUrl}
            />
          </div>
        )}

        {/* 处理结果 */}
        {session && article && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-600">✅ 文章处理完成</h3>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                处理新文章
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">{article.title}</h4>
              {article.description && (
                <p className="text-gray-600 text-sm mb-3">{article.description}</p>
              )}
              {saved && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={saved.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    📖 查看文章
                  </a>
                  <Link
                    href={`/${session.user?.username || 'user'}`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    📚 我的文章
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(saved.url);
                      alert('链接已复制到剪贴板');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    📋 复制链接
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 游客功能介绍 */}
        {!session && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">功能特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📄</div>
                <div>
                  <h3 className="font-medium mb-2">智能文章抓取</h3>
                  <p className="text-sm text-gray-600">一键抓取网络文章内容，自动格式化排版，保持原文结构</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-medium mb-2">营销推广定制</h3>
                  <p className="text-sm text-gray-600">添加品牌Logo、联系方式，每篇文章都是您的营销工具</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔖</div>
                <div>
                  <h3 className="font-medium mb-2">书签一键转发</h3>
                  <p className="text-sm text-gray-600">浏览器书签工具，在任意网页一键转发，高效便捷</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💎</div>
                <div>
                  <h3 className="font-medium mb-2">VIP高级功能</h3>
                  <p className="text-sm text-gray-600">无限制处理，长图生成，高级定制，专业营销利器</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 快捷链接 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/subscription/pricing" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-medium text-gray-900">VIP订阅</div>
            <div className="text-sm text-gray-500">解锁高级功能</div>
          </Link>
          
          <Link href="/contact" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📞</div>
            <div className="font-medium text-gray-900">联系我们</div>
            <div className="text-sm text-gray-500">获取帮助支持</div>
          </Link>
          
          <Link href="/privacy" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="font-medium text-gray-900">隐私政策</div>
            <div className="text-sm text-gray-500">了解数据保护</div>
          </Link>
          
          <Link href="/terms" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium text-gray-900">服务条款</div>
            <div className="text-sm text-gray-500">使用规则说明</div>
          </Link>
        </div>
      </div>
    </div>
  );
}