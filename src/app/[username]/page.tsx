'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

interface UserProfile {
  username: string;
  name: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
}

interface Article {
  slug: string;
  title: string;
  description?: string;
  created_at: string;
  marketing_data?: any;
}

export default function UserPage({ params }: UserPageProps) {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;
    loadUserData();
  }, [username, session]);

  const loadUserData = async () => {
    try {
      // 获取用户信息
      const profileResponse = await fetch(`/api/user/${username}`);
      const profileResult = await profileResponse.json();

      if (profileResult.success) {
        setUserProfile(profileResult.data.profile);
        setArticles(profileResult.data.articles);
        
        // 检查是否是当前用户的页面
        setIsOwner(session?.user?.username === username);
      } else {
        setUserProfile(null);
        setArticles([]);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setUserProfile(null);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">用户未找到</h1>
          <p className="text-gray-600 mb-6">用户名 @{username} 不存在或已被删除</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 用户信息头部 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              {userProfile.avatar_url && (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full mr-6"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                <p className="text-lg text-gray-600 mb-2">@{username}</p>
                {userProfile.bio && (
                  <p className="text-gray-700 mb-3 max-w-2xl">{userProfile.bio}</p>
                )}
                {userProfile.website && (
                  <a
                    href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {userProfile.website}
                  </a>
                )}
              </div>
            </div>
            
            {isOwner && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-center"
                >
                  编辑资料
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                >
                  发布新文章
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 文章统计 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{articles.length}</div>
              <div className="text-gray-600">发布文章</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {articles.reduce((total, article) => total + (article.title.length > 0 ? 1 : 0), 0)}
              </div>
              <div className="text-gray-600">总阅读量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(userProfile.avatar_url || '').getFullYear() || '2024'}
              </div>
              <div className="text-gray-600">加入年份</div>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">发布的文章</h2>
          </div>
          
          {articles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
              <p className="text-gray-600">
                {isOwner ? '开始发布您的第一篇文章吧！' : `${userProfile.name} 还没有发布任何文章`}
              </p>
              {isOwner && (
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  发布文章
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {articles.map((article) => (
                <div key={article.slug} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/${username}/${article.slug}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <time>{new Date(article.created_at).toLocaleDateString('zh-CN')}</time>
                          {article.marketing_data?.companyName && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{article.marketing_data.companyName}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    </div>
                    
                    {article.marketing_data?.logo && (
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={article.marketing_data.logo}
                          alt="Article logo"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 返回首页 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            ← 返回 SharetoX 首页
          </Link>
        </div>
      </div>
    </div>
  );
}