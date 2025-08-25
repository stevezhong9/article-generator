import { Metadata } from 'next';
import { kv } from '@vercel/kv';

interface ArticleLayoutProps {
  params: Promise<{
    slug: string;
  }>;
  children: React.ReactNode;
}

async function getArticle(slug: string) {
  try {
    // 在服务端尝试从KV获取文章数据
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const article = await kv.get(`article:${slug}`);
      return article as any;
    }
    return null;
  } catch (error) {
    console.error('获取文章元数据失败:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticleLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: '文章未找到 - 文章转载工具',
      description: '该文章可能已被删除或链接无效',
    };
  }

  const title = `${article.title} - 文章转载工具`;
  const description = article.description || `阅读「${article.title}」的完整内容。通过文章转载工具生成的高质量文章页面。`;
  const siteName = article.marketingData?.companyName || '文章转载工具';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app';
  const articleUrl = `${baseUrl}/${slug}`;
  
  return {
    title,
    description,
    authors: article.author ? [{ name: article.author }] : undefined,
    keywords: [
      article.title,
      '文章转载',
      '内容分享',
      siteName,
      ...(article.author ? [article.author] : [])
    ],
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName,
      type: 'article',
      publishedTime: article.publishDate || article.savedAt,
      authors: article.author ? [article.author] : undefined,
      images: article.marketingData?.logo ? [
        {
          url: article.marketingData.logo,
          width: 800,
          height: 600,
          alt: `${siteName} Logo`,
        }
      ] : undefined,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: article.author ? `@${article.author}` : undefined,
      images: article.marketingData?.logo ? [article.marketingData.logo] : undefined,
    },

    // 其他SEO优化
    alternates: {
      canonical: articleUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Schema.org 结构化数据
    other: {
      'article:author': article.author || '',
      'article:published_time': article.publishDate || article.savedAt,
      'article:section': '转载文章',
      'og:locale': 'zh_CN',
    },
  };
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: '文章标题将在客户端动态设置',
            description: '文章描述将在客户端动态设置',
            author: {
              '@type': 'Person',
              name: '作者将在客户端动态设置'
            },
            publisher: {
              '@type': 'Organization',
              name: '文章转载工具',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app'
            },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app'
            }
          })
        }}
      />
      {children}
    </>
  );
}