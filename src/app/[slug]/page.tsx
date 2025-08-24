import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleFrontmatter {
  title: string;
  slug: string;
  source_url: string;
  created_at: string;
  author?: string;
  publish_date?: string;
  description?: string;
}

interface ArticleData {
  frontmatter: ArticleFrontmatter;
  content: string;
}

async function getArticle(slug: string): Promise<ArticleData | null> {
  try {
    const articlesDir = path.join(process.cwd(), 'articles');
    const filePath = path.join(articlesDir, `${slug}.md`);
    
    console.log('尝试读取文章文件:', filePath);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // 解析frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/;
    const match = fileContent.match(frontmatterRegex);
    
    if (!match) {
      console.log('无法解析frontmatter');
      return null;
    }
    
    const [, frontmatterString, content] = match;
    
    // 解析frontmatter字段
    const frontmatter: Partial<ArticleFrontmatter> = {};
    frontmatterString.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(/^"|"$/g, '');
        frontmatter[key.trim() as keyof ArticleFrontmatter] = value;
      }
    });
    
    return {
      frontmatter: frontmatter as ArticleFrontmatter,
      content: content.trim()
    };
  } catch (error) {
    console.error('读取文章失败:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  console.log('访问文章页面，slug:', slug);
  
  const article = await getArticle(slug);
  
  if (!article) {
    console.log('文章未找到:', slug);
    notFound();
  }
  
  const { frontmatter, content } = article;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 文章头部 */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {frontmatter.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 space-y-2">
              {frontmatter.author && (
                <div className="w-full sm:w-auto sm:mr-6">
                  <span className="font-medium">作者：</span>
                  <span>{frontmatter.author}</span>
                </div>
              )}
              
              {frontmatter.publish_date && (
                <div className="w-full sm:w-auto sm:mr-6">
                  <span className="font-medium">发布时间：</span>
                  <span>{new Date(frontmatter.publish_date).toLocaleString('zh-CN')}</span>
                </div>
              )}
              
              <div className="w-full sm:w-auto sm:mr-6">
                <span className="font-medium">保存时间：</span>
                <span>{new Date(frontmatter.created_at).toLocaleString('zh-CN')}</span>
              </div>
              
              {frontmatter.source_url && (
                <div className="w-full sm:w-auto">
                  <span className="font-medium">原文链接：</span>
                  <a 
                    href={frontmatter.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    查看原文
                  </a>
                </div>
              )}
            </div>
            
            {frontmatter.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">{frontmatter.description}</p>
              </div>
            )}
          </div>
          
          {/* 文章内容 */}
          <div className="px-6 py-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
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
              
              <div className="text-sm text-gray-500">
                文件：{slug}.md
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 生成静态参数（可选，用于静态生成）
export async function generateStaticParams() {
  try {
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = await fs.readdir(articlesDir);
    
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        slug: file.replace('.md', '')
      }));
  } catch {
    return [];
  }
}

// 元数据生成
export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: '文章未找到',
    };
  }
  
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description || article.frontmatter.title,
  };
}