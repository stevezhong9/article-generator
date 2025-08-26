'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserProfile } from '@/lib/supabase';
import { MarketingData } from '@/components/MarketingInfo';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [marketingData, setMarketingData] = useState<MarketingData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile();
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProfile(result.data);
        setUsername(result.data.username || '');
        setBio(result.data.bio || '');
        setWebsite(result.data.website || '');
        setMarketingData(result.data.marketing_data || {});
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
  };

  const checkUsername = async (usernameValue: string) => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameStatus(null);
      return;
    }

    // 检查用户名格式（只允许英文字母、数字和下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
      setUsernameStatus(null);
      setError('用户名只能包含英文字母、数字和下划线');
      return;
    }

    setUsernameStatus('checking');
    setError(null);

    try {
      const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(usernameValue)}`);
      const result = await response.json();
      
      setUsernameStatus(result.available ? 'available' : 'taken');
    } catch (error) {
      console.error('检查用户名失败:', error);
      setUsernameStatus(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username !== (profile?.username || '')) {
        checkUsername(username);
      } else {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, profile]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    if (username && usernameStatus !== 'available' && username !== (profile?.username || '')) {
      setError('请选择一个可用的用户名');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || null,
          bio: bio || null,
          website: website || null,
          marketingData: Object.keys(marketingData).length > 0 ? marketingData : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        setSuccess('配置已保存！');
        // 刷新session以更新用户名
        window.location.reload();
      } else {
        setError(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setError('保存失败，请稍后重试');
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h1>
            <p className="text-gray-600 mb-6">请先登录以访问个人配置页面</p>
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">个人配置</h1>
          <p className="text-gray-600">设置您的个人信息和自定义用户名</p>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <img
              src={session.user?.image || ''}
              alt={session.user?.name || ''}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{session.user?.name}</h2>
              <p className="text-gray-600">{session.user?.email}</p>
              {profile?.username && (
                <p className="text-sm text-blue-600">
                  个人页面: <code>sharetox.com/{profile.username}</code>
                </p>
              )}
            </div>
          </div>

          {/* 表单 */}
          <div className="space-y-6">
            {/* 用户名设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义用户名 <span className="text-gray-400">(可选)</span>
              </label>
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    sharetox.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="yourname"
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                {usernameStatus === 'checking' && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {usernameStatus === 'available' && username !== (profile?.username || '') && (
                  <div className="absolute right-3 top-2.5 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {usernameStatus === 'taken' && (
                  <div className="absolute right-3 top-2.5 text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                用户名将用于您的个人页面链接，只能包含英文字母、数字和下划线，3-30个字符
              </p>
              {usernameStatus === 'taken' && (
                <p className="mt-1 text-sm text-red-600">该用户名已被使用</p>
              )}
              {usernameStatus === 'available' && username !== (profile?.username || '') && (
                <p className="mt-1 text-sm text-green-600">用户名可用</p>
              )}
            </div>

            {/* 个人简介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                个人简介 <span className="text-gray-400">(可选)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下自己..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">{bio.length}/200</p>
            </div>

            {/* 个人网站 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                个人网站 <span className="text-gray-400">(可选)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://your-website.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 品牌营销信息 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">品牌营销信息</h3>
              <p className="text-sm text-gray-600 mb-4">
                设置您的品牌信息，将在您的主页和文章中展示，帮助推广您的品牌。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 公司名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司/品牌名称
                  </label>
                  <input
                    type="text"
                    value={marketingData.companyName || ''}
                    onChange={(e) => setMarketingData({...marketingData, companyName: e.target.value})}
                    placeholder="您的公司或品牌名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    品牌Logo链接
                  </label>
                  <input
                    type="url"
                    value={marketingData.logo || ''}
                    onChange={(e) => setMarketingData({...marketingData, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 公司网站 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司官网
                  </label>
                  <input
                    type="url"
                    value={marketingData.website || ''}
                    onChange={(e) => setMarketingData({...marketingData, website: e.target.value})}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 联系邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱
                  </label>
                  <input
                    type="email"
                    value={marketingData.email || ''}
                    onChange={(e) => setMarketingData({...marketingData, email: e.target.value})}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 联系电话 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={marketingData.phone || ''}
                    onChange={(e) => setMarketingData({...marketingData, phone: e.target.value})}
                    placeholder="400-123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Logo预览 */}
              {marketingData.logo && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo预览</label>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <img 
                      src={marketingData.logo} 
                      alt="Brand Logo Preview"
                      className="h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 错误和成功消息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                退出登录
              </button>
              <button
                onClick={handleSave}
                disabled={loading || (!!username && usernameStatus === 'taken')}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}