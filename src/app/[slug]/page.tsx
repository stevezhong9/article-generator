'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import LongImageGenerator from '@/components/LongImageGenerator';
import RecentArticles from '@/components/RecentArticles';
import { MarketingData } from '@/components/MarketingInfo';
import '@/styles/article.css';

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
  author?: string;
  publishDate?: string;
  description?: string;
  sourceUrl?: string;
  marketingData?: MarketingData | null;
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

    // 优先从服务器API获取文章
    loadFromAPI();

    async function loadFromAPI() {
      try {
        console.log('从API获取文章:', slug);
        const response = await fetch(`/api/articles/${slug}`);
        const result = await response.json();

        if (result.success && result.data) {
          const articleData = result.data;
          const articleRecord: ArticleRecord = {
            slug: articleData.slug,
            title: articleData.title,
            content: articleData.content,
            markdown: articleData.markdown,
            url: articleData.url,
            savedAt: articleData.savedAt
          };
          
          console.log('从API获取文章成功:', articleRecord.title);
          setArticle(articleRecord);
          
          // 缓存到localStorage
          localStorage.setItem(`article-${slug}`, JSON.stringify(articleRecord));
          
        } else {
          console.log('API未找到文章，尝试其他方式:', slug);
          // 回退到URL参数或localStorage
          loadFromOtherSources();
        }
      } catch (error) {
        console.error('API获取文章失败:', error);
        // 回退到其他数据源
        loadFromOtherSources();
      } finally {
        setLoading(false);
      }
    }

    function loadFromOtherSources() {
      // 检查URL参数中是否包含文章数据
      const urlParams = new URLSearchParams(window.location.search);
      const urlData = urlParams.get('data');

      if (urlData) {
        // 从URL参数解码文章数据
        try {
          console.log('从URL参数解码文章数据...');
          const decodedData = decodeURIComponent(atob(urlData));
          const articleData = JSON.parse(decodedData);
          
          const articleRecord: ArticleRecord = {
            slug: articleData.slug || slug,
            title: articleData.title,
            content: articleData.content,
            markdown: articleData.content,
            url: `/${slug}`,
            savedAt: articleData.savedAt || new Date().toISOString()
          };
          
          console.log('URL参数解码成功:', articleRecord.title);
          setArticle(articleRecord);
          
          // 同时保存到localStorage作为缓存
          localStorage.setItem(`article-${slug}`, JSON.stringify(articleRecord));
          
        } catch (error) {
          console.error('URL参数解码失败:', error);
          // 回退到localStorage读取
          loadFromLocalStorage();
        }
      } else {
        // 从本地存储读取文章
        loadFromLocalStorage();
      }
    }

    function loadFromLocalStorage() {
      try {
        const articleData = localStorage.getItem(`article-${slug}`);
        if (articleData) {
          const parsedArticle = JSON.parse(articleData) as ArticleRecord;
          console.log('从localStorage读取文章:', parsedArticle.title);
          setArticle(parsedArticle);
        } else {
          console.log('文章未找到:', slug);
          setArticle(null);
        }
      } catch (error) {
        console.error('读取文章失败:', error);
        setArticle(null);
      }
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

  // 生成结构化数据
  const generateStructuredData = () => {
    if (!article) return {};
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || typeof window !== 'undefined' ? window.location.origin : '';
    const articleUrl = `${baseUrl}/${article.slug}`;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description || article.title,
      author: {
        '@type': 'Person',
        name: article.author || '未知作者'
      },
      publisher: {
        '@type': 'Organization',
        name: article.marketingData?.companyName || '文章转载工具',
        logo: article.marketingData?.logo ? {
          '@type': 'ImageObject',
          url: article.marketingData.logo
        } : undefined
      },
      datePublished: article.publishDate || article.savedAt,
      dateModified: article.savedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl
      },
      url: articleUrl,
      image: article.marketingData?.logo || undefined,
      inLanguage: 'zh-CN',
      isAccessibleForFree: true,
      genre: '转载文章'
    };
  };

  // 动态更新页面标题和元数据
  useEffect(() => {
    if (article) {
      // 更新页面标题
      document.title = `${article.title} - ${article.marketingData?.companyName || '文章转载工具'}`;
      
      // 更新或创建 meta 标签
      const updateMeta = (name: string, content: string, property?: boolean) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', name);
          } else {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // 基本 meta 标签
      updateMeta('description', article.description || `阅读「${article.title}」的完整内容。`);
      updateMeta('keywords', `${article.title}, 文章转载, 内容分享${article.author ? `, ${article.author}` : ''}`);
      updateMeta('author', article.author || '未知作者');
      
      // Open Graph 标签
      updateMeta('og:title', article.title, true);
      updateMeta('og:description', article.description || `阅读「${article.title}」的完整内容。`, true);
      updateMeta('og:type', 'article', true);
      updateMeta('og:url', window.location.href, true);
      updateMeta('og:site_name', article.marketingData?.companyName || '文章转载工具', true);
      
      if (article.marketingData?.logo) {
        updateMeta('og:image', article.marketingData.logo, true);
      }
      if (article.publishDate) {
        updateMeta('article:published_time', article.publishDate, true);
      }
      if (article.author) {
        updateMeta('article:author', article.author, true);
      }
      
      // Twitter Card 标签
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', article.title);
      updateMeta('twitter:description', article.description || `阅读「${article.title}」的完整内容。`);
      if (article.marketingData?.logo) {
        updateMeta('twitter:image', article.marketingData.logo);
      }

      // 添加结构化数据
      let structuredData = document.querySelector('#structured-data-script') as HTMLScriptElement;
      if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.id = 'structured-data-script';
        structuredData.type = 'application/ld+json';
        document.head.appendChild(structuredData);
      }
      structuredData.textContent = JSON.stringify(generateStructuredData());
    }
  }, [article]);

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
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* 顶部品牌区域 */}
      {article.marketingData?.logo && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4 text-center">
            <img 
              src={article.marketingData.logo} 
              alt="Brand Logo" 
              className="h-12 mx-auto object-contain block"
            />
            {article.marketingData.companyName && (
              <div className="mt-2 text-sm text-gray-600">
                {article.marketingData.companyName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="max-w-3xl mx-auto bg-white min-h-screen">
        {/* 标签切换栏 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('article')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'article'
                  ? 'text-black border-b-2 border-black bg-white'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              阅读文章
            </button>
            <button
              onClick={() => setActiveTab('longimage')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'longimage'
                  ? 'text-black border-b-2 border-black bg-white'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              生成长图
            </button>
          </div>
        </div>

        {activeTab === 'article' ? (
          <article className="px-6 py-8">
            {/* 文章标题 */}
            <header className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>
              
              {/* 文章元信息 */}
              <div className="flex flex-wrap justify-center items-center text-sm text-gray-500 gap-4">
                {article.author && (
                  <span>{article.author}</span>
                )}
                {article.publishDate && (
                  <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                )}
                <span>{new Date(article.savedAt).toLocaleDateString('zh-CN')}</span>
              </div>
              
              {article.description && (
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  {article.description}
                </p>
              )}
            </header>

            {/* 文章内容 - 微信公众号样式 */}
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 转载来源 */}
            {article.sourceUrl && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📄 转载来源</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    本文转载自原作者，版权归原作者所有
                  </p>
                  <div className="text-sm">
                    <span className="text-gray-500">原文链接: </span>
                    <a 
                      href={article.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {article.sourceUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 联系方式区域 */}
            {article.marketingData && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">联系我们</h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    {article.marketingData.website && (
                      <div>
                        <span className="font-medium">官网: </span>
                        <a 
                          href={article.marketingData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {article.marketingData.website}
                        </a>
                      </div>
                    )}
                    
                    {(article.marketingData.email || article.marketingData.phone) && (
                      <div className="flex justify-center gap-6">
                        {article.marketingData.email && (
                          <div>
                            <span className="font-medium">邮箱: </span>
                            <a 
                              href={`mailto:${article.marketingData.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {article.marketingData.email}
                            </a>
                          </div>
                        )}
                        
                        {article.marketingData.phone && (
                          <div>
                            <span className="font-medium">电话: </span>
                            <a 
                              href={`tel:${article.marketingData.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {article.marketingData.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>
        ) : (
          <div className="px-6 py-8">
            <LongImageGenerator article={article} />
          </div>
        )}

        {/* 底部工具栏 */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center"
            >
              ← 返回首页
            </Link>
            
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(article.markdown);
                  alert('内容已复制到剪贴板！');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                复制内容
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制到剪贴板！');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                复制链接
              </button>
            </div>
          </div>
        </div>

        {/* 最近文章列表 */}
        <div className="border-t border-gray-100 px-6 py-8">
          <RecentArticles />
        </div>
      </div>
    </div>
  );
}

