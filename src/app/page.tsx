'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import Link from 'next/link';
import ArticleForm from '@/components/ArticleForm';
import { MarketingData } from '@/components/MarketingInfo';
import SimpleGoogleLogin from '@/components/SimpleGoogleLogin';

export default function Home() {
  const { data: session, status } = useSession();
  const [showLoadingFallback, setShowLoadingFallback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);
  const [initialUrl, setInitialUrl] = useState('');
  const [savedFormData, setSavedFormData] = useState<any>(null);

  // 检查URL参数，用于书签工具
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam) {
      setInitialUrl(decodeURIComponent(urlParam));
    }
  }, []);

  // 用户登录后自动恢复表单数据
  useEffect(() => {
    if (session && status === 'authenticated') {
      const savedData = restoreFormData();
      if (savedData) {
        // 如果有保存的数据，设置到状态中供表单使用
        console.log('发现已保存的表单数据:', savedData);
        setSavedFormData(savedData);
        setError(`✅ 欢迎回来！我们为您恢复了之前填写的表单数据，您可以继续完成提交。`);
      }
    }
  }, [session, status]);

  // 短暂显示加载状态，但不会无限等待
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setShowLoadingFallback(true);
      }, 800); // 减少到0.8秒
      return () => clearTimeout(timer);
    } else {
      setShowLoadingFallback(false);
    }
  }, [status]);

  // 保存表单数据到localStorage
  const saveFormData = (url: string, marketingData?: MarketingData) => {
    const formData = { url, marketingData };
    localStorage.setItem('shareto_form_data', JSON.stringify(formData));
  };

  // 从localStorage恢复表单数据
  const restoreFormData = () => {
    const saved = localStorage.getItem('shareto_form_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('恢复表单数据失败:', error);
      }
    }
    return null;
  };

  // 清除保存的表单数据
  const clearFormData = () => {
    localStorage.removeItem('shareto_form_data');
  };

  // 处理文章提交
  const handleArticleSubmit = async (url: string, marketingData?: MarketingData) => {
    // 检查登录状态
    if (!session) {
      // 保存表单数据
      saveFormData(url, marketingData);
      // 提示用户登录
      setError('请先登录后再提交。您的表单数据已保存，登录后将自动恢复。');
      return;
    }

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
        // 清除保存的表单数据（成功提交后）
        clearFormData();
        setSavedFormData(null);
        
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
    setSavedFormData(null);
    clearFormData();
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
  // 只在很短时间内显示loading，避免长时间等待
  if (status === 'loading' && !showLoadingFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Logo size="lg" linkToHome={false} priority className="drop-shadow-2xl mb-4" />
            <p className="text-sm text-gray-500">一键转发文章，智能营销推广</p>
            <div className="flex items-center justify-center mt-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
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



        {/* 主要功能区域 - 一键转发表单 */}
        {!article && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 左侧：一键转发表单 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🚀</span>
                  一键转发
                </h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const url = formData.get('url') as string;
                  const marketingData = {
                    logo: formData.get('logo') as string,
                    companyName: formData.get('companyName') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                  };
                  handleArticleSubmit(url, marketingData);
                }} className="space-y-6">
                  
                  {/* 转发文章区域 - 主要突出 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-300">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="text-xl mr-2">📋</span>
                      转发文章
                    </h3>
                    <input
                      type="url"
                      name="url"
                      defaultValue={savedFormData?.url || initialUrl}
                      placeholder="粘贴要转发的文章URL，如：https://example.com/article"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>

                  {/* 营销推广区域 */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-xl mr-2">🎯</span>
                      营销推广信息
                      <span className="ml-2 text-xs text-gray-500">(可选)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo图标URL</label>
                        <input
                          type="url"
                          name="logo"
                          defaultValue={savedFormData?.marketingData?.logo || ''}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">品牌名称</label>
                        <input
                          type="text"
                          name="companyName"
                          defaultValue={savedFormData?.marketingData?.companyName || ''}
                          placeholder="您的品牌名称"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                        <input
                          type="tel"
                          name="phone"
                          defaultValue={savedFormData?.marketingData?.phone || ''}
                          placeholder="400-123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={savedFormData?.marketingData?.email || ''}
                          placeholder="contact@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 开始转发按钮 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        转发中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="text-2xl mr-2">🚀</span>
                        开始转发
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* 右侧：用户登录和书签工具 */}
            <div className="lg:col-span-1">
              {/* User Authentication */}
              <div className="mb-4">
                <SimpleGoogleLogin
                  onSuccess={() => {
                    console.log('登录成功');
                    setError(null);
                  }}
                  onError={(error) => {
                    console.error('登录失败:', error);
                    setError(error);
                  }}
                  callbackUrl="/"
                  showUserInfo={true}
                  buttonText="使用 Google 登录"
                />
              </div>
              
              {/* 书签工具 */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 h-fit">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔖</div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">书签工具</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    拖拽按钮到浏览器书签栏，在任意网页一键转发
                  </p>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <a
                      href={generateBookmarklet()}
                      className="inline-flex items-center px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 cursor-move select-none shadow-lg transform hover:scale-105 transition-all duration-200"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/html', `<a href="${generateBookmarklet()}">SharetoX 一键转发</a>`);
                      }}
                    >
                      🚀 SharetoX 一键转发
                    </a>
                    
                    <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded text-center">
                      💡 拖拽到书签栏后，在任意文章页面点击即可快速转发
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 处理结果 */}
        {article && (
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