import { NextRequest, NextResponse } from 'next/server';
import { ArticleData } from '@/lib/scraper';
import { MarketingData } from '@/components/MarketingInfo';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const requestData: { 
      url: string; 
      marketingData?: MarketingData;
    } & ArticleData = await request.json();
    
    const { url, marketingData, ...articleData } = requestData;
    const fullArticleData = { ...articleData, url };
    
    console.log('=== SAVE API DEBUG ===');
    console.log('收到的完整数据:', JSON.stringify(fullArticleData, null, 2));
    
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

    // 准备存储的文章数据
    const articleRecord = {
      slug: finalSlug,
      title: fullArticleData.title,
      content: fullArticleData.content, // 原始HTML内容
      markdown: fullContent, // 带frontmatter的完整内容
      url: `/${finalSlug}`,
      author: fullArticleData.author,
      publishDate: fullArticleData.publishDate,
      description: fullArticleData.description,
      sourceUrl: fullArticleData.url,
      marketingData: marketingData || null,
      savedAt: new Date().toISOString()
    };

    try {
      // 检查是否在生产环境且有KV配置
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // 保存单篇文章
        await kv.set(`article:${finalSlug}`, articleRecord);
        
        // 更新文章列表（保存最近10篇）
        const recentArticles = await kv.get('articles:recent') as any[] || [];
        
        // 添加新文章到列表开头
        const articleSummary = {
          slug: finalSlug,
          title: articleData.title,
          url: `/${finalSlug}`,
          savedAt: articleRecord.savedAt
        };
        
        recentArticles.unshift(articleSummary);
        
        // 只保留最近10篇
        if (recentArticles.length > 10) {
          recentArticles.splice(10);
        }
        
        await kv.set('articles:recent', recentArticles);
        
        console.log(`文章已保存到KV: ${finalSlug}`);
      } else {
        console.log('开发环境：跳过KV存储，使用前端localStorage');
      }
      
    } catch (kvError) {
      console.error('KV存储错误:', kvError);
      // KV失败时回退到返回数据让前端处理
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: finalSlug,
        title: articleData.title,
        content: fullContent,
        url: `/${finalSlug}`,
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