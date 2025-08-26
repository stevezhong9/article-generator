'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LongImageGenerator from '@/components/LongImageGenerator';
import { MarketingData } from '@/components/MarketingInfo';
import '@/styles/article.css';

// Add inline animation styles for loading spinner
const loadingSpinnerStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Insert styles into head if not already there
if (typeof document !== 'undefined') {
  const existingStyles = document.getElementById('loading-spinner-styles');
  if (!existingStyles) {
    const styleElement = document.createElement('style');
    styleElement.id = 'loading-spinner-styles';
    styleElement.innerHTML = loadingSpinnerStyles;
    document.head.appendChild(styleElement);
  }
}

interface ArticlePageProps {
  params: Promise<{
    username: string;
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
  username?: string;
  viewCount?: number;
}

interface UserProfile {
  username: string;
  name: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
}

export default function UserArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'article' | 'longimage'>('article');
  
  // 增加浏览量的函数
  const incrementViewCount = async (articleUsername: string, articleSlug: string) => {
    try {
      await fetch('/api/articles/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: articleUsername, slug: articleSlug }),
      });
    } catch (error) {
      console.error('增加浏览量失败:', error);
    }
  };

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
      setSlug(resolvedParams.slug);
    }
    loadParams();
  }, [params]);

  const loadArticle = async () => {
    try {
      console.log('从API获取用户文章:', username, slug);
      const response = await fetch(`/api/articles/${username}/${slug}`);
      const result = await response.json();

      if (result.success && result.data) {
        const articleData = result.data.article;
        const userProfileData = result.data.userProfile;
        
        const articleRecord: ArticleRecord = {
          slug: articleData.slug,
          title: articleData.title,
          content: articleData.content,
          markdown: articleData.markdown,
          url: `/${username}/${articleData.slug}`,
          savedAt: articleData.savedAt,
          author: articleData.author,
          publishDate: articleData.publishDate,
          description: articleData.description,
          sourceUrl: articleData.sourceUrl,
          marketingData: articleData.marketingData,
          username: articleData.username,
          viewCount: articleData.viewCount
        };
        
        console.log('从API获取文章成功:', articleRecord.title);
        console.log('营销数据:', articleRecord.marketingData);
        setArticle(articleRecord);
        setUserProfile(userProfileData);
        
        // 增加浏览量
        incrementViewCount(username, slug);
        
      } else {
        console.log('API未找到文章:', username, slug);
        setArticle(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('API获取文章失败:', error);
      setArticle(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username || !slug) return;

    console.log('访问用户文章页面，username:', username, 'slug:', slug);
    loadArticle();
  }, [username, slug]);

  // 生成结构化数据
  const generateStructuredData = useCallback(() => {
    if (!article) return {};
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || typeof window !== 'undefined' ? window.location.origin : '';
    const articleUrl = `${baseUrl}/${username}/${article.slug}`;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description || article.title,
      author: {
        '@type': 'Person',
        name: article.author || userProfile?.name || '未知作者',
        url: userProfile ? `${baseUrl}/${username}` : undefined
      },
      publisher: {
        '@type': 'Organization',
        name: article.marketingData?.companyName || userProfile?.name || 'SharetoX',
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
  }, [article, username, userProfile]);

  // 动态更新页面标题和元数据
  useEffect(() => {
    if (article && userProfile) {
      // 更新页面标题
      document.title = `${article.title} - ${userProfile.name} | SharetoX`;
      
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
      updateMeta('author', article.author || userProfile.name || '未知作者');
      
      // Open Graph 标签
      updateMeta('og:title', article.title, true);
      updateMeta('og:description', article.description || `阅读「${article.title}」的完整内容。`, true);
      updateMeta('og:type', 'article', true);
      updateMeta('og:url', window.location.href, true);
      updateMeta('og:site_name', `${userProfile.name} | SharetoX`, true);
      
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
  }, [article, userProfile, generateStructuredData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '32px 0' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '48px',
              width: '48px',
              border: '2px solid #e5e7eb',
              borderBottomColor: '#2563eb',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>正在加载文章...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article || !userProfile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '32px 0' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>文章未找到</h1>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>请检查链接是否正确，或者文章是否已被删除。</p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 调试日志
  console.log('用户文章页面渲染 - 文章数据:', {
    title: article?.title,
    username: article?.username,
    hasMarketingData: !!article?.marketingData,
    marketingData: article?.marketingData,
    userProfile: userProfile
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto bg-white min-h-screen" style={{
        borderRadius: '16px',
        border: '2px solid #e5e7eb',
        marginTop: '20px',
        marginBottom: '20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* 用户信息顶部 */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {userProfile.avatar_url && (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}
                />
              )}
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0'
                }}>
                  {userProfile.name}
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  @{username}
                </p>
              </div>
            </div>
            
            <Link
              href={`/${username}`}
              style={{
                fontSize: '14px',
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              查看更多文章 →
            </Link>
          </div>
          
          {userProfile.bio && (
            <p style={{
              marginTop: '12px',
              fontSize: '14px',
              color: '#4b5563',
              lineHeight: '1.5'
            }}>
              {userProfile.bio}
            </p>
          )}
        </div>

        {/* 顶部品牌Logo区域 - 根据营销信息显示 */}
        {article.marketingData && (article.marketingData.logo || article.marketingData.companyName || article.marketingData.website || article.marketingData.email) && (
          <div style={{
            textAlign: 'center',
            padding: '32px 32px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff'
          }}>
            {/* Logo */}
            {article.marketingData.logo && (
              <img 
                src={article.marketingData.logo} 
                alt="Brand Logo" 
                style={{
                  height: '60px',
                  maxWidth: '200px',
                  objectFit: 'contain',
                  marginBottom: '12px',
                  display: 'block',
                  margin: '0 auto 12px auto'
                }}
              />
            )}
            
            {/* 公司名称 */}
            {article.marketingData.companyName && (
              <div style={{
                fontSize: '18px',
                color: '#1f2937',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {article.marketingData.companyName}
              </div>
            )}
            
            {/* 网址和邮箱 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              flexWrap: 'wrap'
            }}>
              {article.marketingData.website && (
                <a 
                  href={article.marketingData.website.startsWith('http') ? article.marketingData.website : `https://${article.marketingData.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#007AFF',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🌐 {article.marketingData.website}
                </a>
              )}
              
              {article.marketingData.website && article.marketingData.email && (
                <span style={{ color: '#d1d5db' }}>|</span>
              )}
              
              {article.marketingData.email && (
                <a 
                  href={`mailto:${article.marketingData.email}`}
                  style={{ 
                    color: '#007AFF',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📧 {article.marketingData.email}
                </a>
              )}
            </div>
          </div>
        )}

        {/* 标签切换栏 */}
        <div style={{
          position: 'sticky',
          top: '0',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f3f4f6',
          zIndex: 10
        }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setActiveTab('article')}
              style={{
                flex: 1,
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '500',
                transition: 'all 0.2s',
                color: activeTab === 'article' ? '#000000' : '#6b7280',
                backgroundColor: activeTab === 'article' ? '#ffffff' : '#f9fafb',
                borderBottom: activeTab === 'article' ? '2px solid #000000' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'article') {
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'article') {
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              阅读文章
            </button>
            <button
              onClick={() => setActiveTab('longimage')}
              style={{
                flex: 1,
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '500',
                transition: 'all 0.2s',
                color: activeTab === 'longimage' ? '#000000' : '#6b7280',
                backgroundColor: activeTab === 'longimage' ? '#ffffff' : '#f9fafb',
                borderBottom: activeTab === 'longimage' ? '2px solid #000000' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'longimage') {
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'longimage') {
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              生成长图
            </button>
          </div>
        </div>

        {activeTab === 'article' ? (
          <article style={{ padding: '32px' }}>
            {/* 文章标题 */}
            <header style={{
              textAlign: 'center',
              marginBottom: '32px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '24px'
            }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '16px',
                lineHeight: '1.2',
                color: '#1f2937'
              }}>
                {article.title}
              </h1>
              
              {/* 文章元信息 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '14px',
                opacity: 0.75,
                gap: '16px',
                color: '#6b7280',
                flexWrap: 'wrap'
              }}>
                <span>📅 {new Date(article.savedAt).toLocaleDateString('zh-CN')}</span>
                <span>•</span>
                <span>📄 {article.marketingData?.companyName || userProfile.name}</span>
                {article.author && article.author !== userProfile.name && (
                  <>
                    <span>•</span>
                    <span>✍️ {article.author}</span>
                  </>
                )}
                {typeof article.viewCount === 'number' && article.viewCount > 0 && (
                  <>
                    <span>•</span>
                    <span>👀 {article.viewCount.toLocaleString()} 浏览</span>
                  </>
                )}
              </div>
              
              {article.description && (
                <p style={{
                  marginTop: '16px',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: '#4b5563'
                }}>
                  {article.description}
                </p>
              )}
            </header>

            {/* 文章内容 */}
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 转载来源 */}
            {(article.sourceUrl || article.marketingData) && (
              <div style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#1f2937'
                  }}>
                    📄 转载信息
                  </h4>
                  
                  {/* 营销推广信息 */}
                  {article.marketingData && (article.marketingData.companyName || article.marketingData.website) && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        color: '#374151'
                      }}>
                        🏢 转载方信息
                      </div>
                      
                      {article.marketingData.companyName && (
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}>
                          {article.marketingData.companyName}
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '13px',
                        flexWrap: 'wrap'
                      }}>
                        {article.marketingData.website && (
                          <a 
                            href={article.marketingData.website.startsWith('http') ? article.marketingData.website : `https://${article.marketingData.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#007AFF',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🌐 官网: {article.marketingData.website}
                          </a>
                        )}
                        
                        {article.marketingData.website && article.marketingData.email && (
                          <span style={{ color: '#d1d5db' }}>|</span>
                        )}
                        
                        {article.marketingData.email && (
                          <a 
                            href={`mailto:${article.marketingData.email}`}
                            style={{ 
                              color: '#007AFF',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📧 邮箱: {article.marketingData.email}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 原文链接 */}
                  {article.sourceUrl && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        marginBottom: '8px',
                        color: '#6b7280'
                      }}>
                        本文转载自原作者，版权归原作者所有
                      </p>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#6b7280' }}>
                          原文链接: 
                        </span>
                        <a 
                          href={article.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007AFF',
                            wordBreak: 'break-all',
                            textDecoration: 'underline'
                          }}
                        >
                          {article.sourceUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        ) : (
          <div style={{ padding: '32px' }}>
            <LongImageGenerator article={article} />
          </div>
        )}

        {/* 底部工具栏 */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          padding: '16px 32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link
              href={`/${username}`}
              style={{
                color: '#6b7280',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              ← 返回{userProfile.name}的主页
            </Link>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px'
            }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(article.markdown);
                  alert('内容已复制到剪贴板！');
                }}
                style={{
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                复制内容
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制到剪贴板！');
                }}
                style={{
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                复制链接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}