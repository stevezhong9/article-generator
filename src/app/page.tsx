'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="text-center mb-12">
          <Logo size="lg" linkToHome={false} priority className="drop-shadow-2xl mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ShareX AI</h1>
          <p className="text-xl text-gray-600">AI超级分享平台</p>
        </div>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {session ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">欢迎, {session.user?.name || session.user?.email}</p>
                <p className="text-gray-600">您已成功登录</p>
              </div>
              <div className="space-x-4">
                <Link href="/profile" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  个人资料
                </Link>
                <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  管理
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">请先登录以使用服务</p>
              <button
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                使用 Google 登录
              </button>
            </div>
          )}
        </div>

        {/* Simple Form */}
        {session && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">文章链接处理</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '处理中...' : '开始处理'}
              </button>
            </form>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">处理结果:</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}