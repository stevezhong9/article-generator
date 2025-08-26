'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession(); // 移除 status 依赖
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

        {/* Auth Status - 简化显示 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {session ? (
            <div className="flex items-center justify-between">
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
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-3">欢迎使用 ShareX AI</h2>
              <p className="text-gray-600 mb-4">请先登录以使用文章转载功能</p>
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                使用 Google 登录
              </button>
            </div>
          )}
        </div>

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
                  <p className="text-sm text-gray-500">文章已成功处理</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 如果没有登录，显示功能介绍 */}
        {!session && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">功能介绍</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="font-medium mb-2">智能文章抓取</h3>
                <p className="text-sm text-gray-600">一键抓取网络文章内容，自动格式化排版</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-medium mb-2">精美页面生成</h3>
                <p className="text-sm text-gray-600">生成优化的文章展示页面，支持分享</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-medium mb-2">VIP高级功能</h3>
                <p className="text-sm text-gray-600">无限制处理，长图生成，高级定制</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-medium mb-2">安全可靠</h3>
                <p className="text-sm text-gray-600">Google OAuth认证，数据安全保护</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
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