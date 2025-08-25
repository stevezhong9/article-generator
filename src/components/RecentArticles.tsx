'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecentArticle {
  slug: string;
  title: string;
  url: string;
  savedAt: string;
}

export default function RecentArticles() {
  const [articles, setArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      const response = await fetch('/api/articles/recent');
      const result = await response.json();
      
      if (result.success) {
        setArticles(result.data);
      }
    } catch (error) {
      console.error('获取最近文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 最近分享的文章</h3>
        <div className="animate-pulse">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 最近分享的文章</h3>
        <p className="text-gray-500 text-sm">暂无最近分享的文章</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 最近分享的文章</h3>
      
      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.slug} className="bg-white rounded-md p-3 border border-gray-100 hover:border-gray-300 transition-colors">
            <Link
              href={article.url}
              className="block group"
            >
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {article.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(article.savedAt).toLocaleDateString('zh-CN')}
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          → 转载更多文章
        </Link>
      </div>
    </div>
  );
}