'use client';

import { useState } from 'react';
import ArticleForm from '@/components/ArticleForm';
import ArticlePreview from '@/components/ArticlePreview';
import { ArticleData } from '@/lib/scraper';

export default function Home() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);

  const handleScrape = async (url: string, customPath?: string) => {
    setLoading(true);
    setError(null);
    setSaved(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, customPath }),
      });

      const result = await response.json();

      if (result.success) {
        setArticle(result.data);
      } else {
        setError(result.error || '抓取失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData: ArticleData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();

      if (result.success) {
        setSaved(result.data);
        setArticle(null);
      } else {
        let errorMessage = result.error || '保存失败';
        
        // 如果有调试信息，显示更详细的错误
        if (result.debug) {
          errorMessage += `\n调试信息: 缺少字段 ${result.debug.missingFields?.join(', ') || '未知'}`;
          console.log('保存失败的调试信息:', result.debug);
        }
        
        setError(errorMessage);
      }
    } catch {
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setArticle(null);
    setError(null);
    setSaved(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            文章转载工具
          </h1>
          <p className="text-gray-600">
            输入文章 URL，抓取内容并生成本地文章文件
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  错误
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800 mb-3">
                  🎉 文章保存成功！
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">本地文件：</span> 
                      <code className="bg-green-100 px-2 py-1 rounded font-mono text-xs">{saved.path}</code>
                    </p>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">在线访问：</span></p>
                    <div className="mt-1 flex items-center space-x-3">
                      <a
                        href={saved.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        查看文章
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + saved.url);
                          alert('链接已复制到剪贴板！');
                        }}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制链接
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      链接地址: <code className="bg-green-100 px-1 py-0.5 rounded font-mono">{window.location.origin + saved.url}</code>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-200">
                  <button
                    onClick={handleReset}
                    className="text-sm text-green-800 hover:text-green-900 font-medium underline transition-colors duration-200"
                  >
                    继续转载更多文章 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!article && !saved && (
          <div className="max-w-md mx-auto">
            <ArticleForm onSubmit={handleScrape} loading={loading} />
          </div>
        )}

        {article && (
          <ArticlePreview
            article={article}
            onSave={handleSave}
            onEdit={handleReset}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
