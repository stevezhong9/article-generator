'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
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
        // 自动保存
        setTimeout(async () => {
          try {
            const saveResponse = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...result.data,
                userId: session?.user?.id,
                username: session?.user?.username
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
    setUrl('');
    setArticle(null);
    setError(null);
    setSaved(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShareX AI</h1>
          <p className="text-lg text-gray-600 mb-1">AI超级分享平台</p>
          <p className="text-sm text-gray-500">Powered by ShareX AI Technology</p>
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
              <Link href="/profile" className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
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
              onClick={() => signIn('google')}
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

        {/* Main Form */}
        {session && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">文章链接处理</h2>
            
            {!article ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 待转发文章URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '处理中...' : '🚀 开始处理'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-600">✅ 处理完成</h3>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    处理新链接
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">{article.title}</h4>
                  {article.description && (
                    <p className="text-gray-600 text-sm mb-3">{article.description}</p>
                  )}
                  {saved && (
                    <div className="flex space-x-3">
                      <a
                        href={saved.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        查看文章
                      </a>
                      <Link
                        href={`/${session.user?.username || 'user'}`}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        我的文章
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/subscription/pricing" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-medium text-gray-900">VIP订阅</div>
            <div className="text-sm text-gray-500">解锁高级功能</div>
          </Link>
          
          <Link href="/profile" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-gray-900">个人资料</div>
            <div className="text-sm text-gray-500">管理账户信息</div>
          </Link>
          
          <Link href="/contact" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📞</div>
            <div className="font-medium text-gray-900">联系我们</div>
            <div className="text-sm text-gray-500">获取帮助支持</div>
          </Link>
          
          <Link href="/admin" className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-gray-900">管理后台</div>
            <div className="text-sm text-gray-500">系统管理</div>
          </Link>
        </div>
      </div>
    </div>
  );
}