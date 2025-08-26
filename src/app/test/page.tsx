'use client';

import { useState } from 'react';
import Logo from '@/components/Logo';
import { MarketingData } from '@/components/MarketingInfo';

// 本地测试页面 - 模拟用户登录状态来测试一键转发表单
export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);
  const [initialUrl, setInitialUrl] = useState('');

  // 模拟用户session
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: '测试用户',
      email: 'test@example.com',
      username: 'testuser'
    }
  };

  // 处理文章提交 - 本地测试版本
  const handleArticleSubmit = async (url: string, marketingData?: MarketingData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('测试提交:', { url, marketingData });
      
      // 调用本地测试API
      const response = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setArticle(result.data);
        
        // 模拟保存成功
        setTimeout(() => {
          setSaved({
            path: `/testuser/${result.data.slug}`,
            url: `http://localhost:3000/testuser/${result.data.slug}`
          });
        }, 1000);
      } else {
        setError(result.error || result.message || '抓取失败');
      }
      
    } catch (error) {
      console.error('测试错误:', error);
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
      const siteName = 'http://localhost:3000';
      window.open(siteName + '/test?url=' + encodeURIComponent(currentUrl), '_blank', 'width=800,height=600');
    })();`;
    return bookmarkletCode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" linkToHome={false} priority className="drop-shadow-2xl mb-4" />
          <p className="text-sm text-gray-500">一键转发文章，智能营销推广</p>
          <div className="mt-4 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
            🧪 本地测试模式 - 模拟用户已登录状态
          </div>
        </div>

        {/* Mock User Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {mockSession.user?.name?.charAt(0) || 'T'}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{mockSession.user?.name || mockSession.user?.email}</p>
              <p className="text-sm text-gray-500">已登录 (测试模式)</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              我的文章
            </button>
            <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
              个人资料
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              退出
            </button>
          </div>
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
                      defaultValue={initialUrl}
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
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">品牌名称</label>
                        <input
                          type="text"
                          name="companyName"
                          placeholder="您的品牌名称"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="400-123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                        <input
                          type="email"
                          name="email"
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

            {/* 右侧：书签工具 */}
            <div className="lg:col-span-1">
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
                        e.dataTransfer.setData('text/html', `<a href="${generateBookmarklet()}">ShareX 一键转发</a>`);
                      }}
                    >
                      🚀 ShareX 一键转发
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
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    📚 我的文章
                  </button>
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

        {/* 测试说明 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 本地测试说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-medium mb-2">一键转发表单</h3>
                <p className="text-sm text-gray-600">已完整展示，包含文章URL输入和营销推广信息</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🔖</div>
              <div>
                <h3 className="font-medium mb-2">书签工具</h3>
                <p className="text-sm text-gray-600">可拖拽到书签栏，测试一键转发功能</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-medium mb-2">营销功能</h3>
                <p className="text-sm text-gray-600">支持添加Logo、品牌名称、联系方式</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="font-medium mb-2">响应式设计</h3>
                <p className="text-sm text-gray-600">左侧表单2/3宽度，右侧书签工具1/3宽度</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷链接 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-medium text-gray-900">VIP订阅</div>
            <div className="text-sm text-gray-500">解锁高级功能</div>
          </button>
          
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📞</div>
            <div className="font-medium text-gray-900">联系我们</div>
            <div className="text-sm text-gray-500">获取帮助支持</div>
          </button>
          
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="font-medium text-gray-900">隐私政策</div>
            <div className="text-sm text-gray-500">了解数据保护</div>
          </button>
          
          <button className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium text-gray-900">服务条款</div>
            <div className="text-sm text-gray-500">使用规则说明</div>
          </button>
        </div>
      </div>
    </div>
  );
}