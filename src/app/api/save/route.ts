import { NextRequest, NextResponse } from 'next/server';
import { ArticleData } from '@/lib/scraper';
import { MarketingData } from '@/components/MarketingInfo';
import { ArticleSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const requestData: { 
      url: string; 
      marketingData?: MarketingData;
      userId?: string;
      username?: string;
    } & ArticleData = await request.json();
    
    const { url, marketingData, userId, username, ...articleData } = requestData;
    const fullArticleData = { ...articleData, url };
    
    console.log('=== SAVE API DEBUG ===');
    console.log('收到的完整数据:', JSON.stringify(fullArticleData, null, 2));
    console.log('营销数据:', JSON.stringify(marketingData, null, 2));
    
    // 检查必需字段
    const missingFields = [];
    if (!fullArticleData.title) missingFields.push('title');
    if (!fullArticleData.content) missingFields.push('content');
    if (!fullArticleData.slug) missingFields.push('slug');
    if (!fullArticleData.url) missingFields.push('url');

    if (missingFields.length > 0) {
      const errorMessage = `缺少必需的文章数据字段: ${missingFields.join(', ')}`;
      console.log('错误:', errorMessage);
      return NextResponse.json(
        { 
          error: errorMessage,
          success: false
        },
        { status: 400 }
      );
    }

    // 使用 Vercel KV 存储文章
    const frontmatter = generateFrontmatter(fullArticleData);
    const fullContent = `${frontmatter}\n\n${fullArticleData.content}`;

    // 生成唯一的文章ID
    const timestamp = Date.now();
    const finalSlug = `${fullArticleData.slug}-${timestamp}`;

    // 这个变量已经不再需要，因为我们直接使用Postgres存储

    try {
      // 保存文章到Supabase
      const savedArticle = await ArticleSupabase.createArticle({
        slug: finalSlug,
        title: fullArticleData.title,
        content: fullArticleData.content,
        description: fullArticleData.description,
        author: fullArticleData.author,
        publish_date: fullArticleData.publishDate,
        source_url: fullArticleData.url,
        marketing_data: marketingData || undefined,
        user_id: userId || undefined,
        username: username || undefined
      });
      
      console.log(`文章已保存到Supabase: ${savedArticle.slug}`);
      
    } catch (supabaseError) {
      console.error('Supabase存储错误:', supabaseError);
      // Supabase失败时返回错误
      return NextResponse.json(
        { 
          error: `Supabase保存失败: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`,
          success: false
        },
        { status: 500 }
      );
    }

    // 生成URL路径，优先使用用户名结构
    const articleUrl = username ? `/${username}/${finalSlug}` : `/${finalSlug}`;

    return NextResponse.json({
      success: true,
      data: {
        slug: finalSlug,
        title: fullArticleData.title,
        content: fullContent,
        url: articleUrl,
        markdown: fullContent
      }
    });

  } catch (error) {
    console.error('API save error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to save article',
        success: false
      },
      { status: 500 }
    );
  }
}

function generateFrontmatter(article: ArticleData): string {
  const frontmatter = [
    '---',
    `title: "${article.title.replace(/"/g, '\\"')}"`,
    `slug: "${article.slug}"`,
    `source_url: "${article.url}"`,
    `created_at: "${new Date().toISOString()}"`,
  ];

  if (article.author) {
    frontmatter.push(`author: "${article.author.replace(/"/g, '\\"')}"`);
  }

  if (article.publishDate) {
    frontmatter.push(`publish_date: "${article.publishDate}"`);
  }

  if (article.description) {
    frontmatter.push(`description: "${article.description.replace(/"/g, '\\"')}"`);
  }

  frontmatter.push('---');

  return frontmatter.join('\n');
}