'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LongImageGenerator from '@/components/LongImageGenerator';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleRecord {
  slug: string;
  title: string;
  content: string;
  markdown: string;
  url: string;
  savedAt: string;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'article' | 'longimage'>('article');

  useEffect(() => {
    async function loadSlug() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    }
    loadSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    console.log('访问文章页面，slug:', slug);

    // 从本地存储读取文章
    try {
      const articleData = localStorage.getItem(`article-${slug}`);
      if (articleData) {
        const parsedArticle = JSON.parse(articleData) as ArticleRecord;
        setArticle(parsedArticle);
      } else {
        console.log('文章未找到:', slug);
        setArticle(null);
      }
    } catch (error) {
      console.error('读取文章失败:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在加载文章...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <p className="text-gray-600 mb-8">请检查链接是否正确，或者文章是否已被删除。</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 文章头部 */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 space-y-2 mb-6">
              <div className="w-full sm:w-auto sm:mr-6">
                <span className="font-medium">保存时间：</span>
                <span>{new Date(article.savedAt).toLocaleString('zh-CN')}</span>
              </div>
              
              <div className="w-full sm:w-auto">
                <span className="font-medium">存储位置：</span>
                <span className="text-blue-600">本地浏览器存储</span>
              </div>
            </div>

            {/* 标签切换 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('article')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'article'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📄 阅读文章
              </button>
              <button
                onClick={() => setActiveTab('longimage')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'longimage'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🖼️ 生成长图
              </button>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="px-6 py-8">
            {activeTab === 'article' && (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
            
            {activeTab === 'longimage' && (
              <LongImageGenerator article={article} />
            )}
          </div>
          
          {/* 底部操作 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 返回首页
              </Link>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(article.markdown);
                    alert('Markdown 内容已复制到剪贴板！');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  复制 Markdown
                </button>
                <div className="text-sm text-gray-500">
                  ID：{article.slug}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

