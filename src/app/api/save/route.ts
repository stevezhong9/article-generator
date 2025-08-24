import { NextRequest, NextResponse } from 'next/server';
import { ArticleData } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const articleData: ArticleData = await request.json();
    
    console.log('=== SAVE API DEBUG ===');
    console.log('收到的完整数据:', JSON.stringify(articleData, null, 2));
    
    // 检查必需字段
    const missingFields = [];
    if (!articleData.title) missingFields.push('title');
    if (!articleData.content) missingFields.push('content');
    if (!articleData.slug) missingFields.push('slug');

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

    // 在 Serverless 环境中，我们不能保存到文件系统
    // 而是将数据返回给前端，让前端处理保存
    const frontmatter = generateFrontmatter(articleData);
    const fullContent = `${frontmatter}\n\n${articleData.content}`;

    // 生成唯一的文章ID
    const timestamp = Date.now();
    const finalSlug = `${articleData.slug}-${timestamp}`;

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