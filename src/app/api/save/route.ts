import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ArticleData } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const articleData: ArticleData = await request.json();
    
    // 添加详细的调试日志
    console.log('=== SAVE API DEBUG ===');
    console.log('收到的完整数据:', JSON.stringify(articleData, null, 2));
    console.log('数据字段检查:');
    console.log('- title:', articleData.title ? `存在 (长度: ${articleData.title.length})` : '缺失');
    console.log('- content:', articleData.content ? `存在 (长度: ${articleData.content.length})` : '缺失');
    console.log('- slug:', articleData.slug ? `存在: "${articleData.slug}"` : '缺失');
    console.log('- url:', articleData.url ? `存在: "${articleData.url}"` : '缺失');
    console.log('- author:', articleData.author ? `存在: "${articleData.author}"` : '缺失');
    console.log('- publishDate:', articleData.publishDate ? `存在: "${articleData.publishDate}"` : '缺失');
    console.log('- description:', articleData.description ? `存在 (长度: ${articleData.description.length})` : '缺失');

    // 检查必需字段，提供更详细的错误信息
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
          debug: {
            missingFields,
            receivedData: {
              title: articleData.title || null,
              content: articleData.content ? `${articleData.content.substring(0, 100)}...` : null,
              slug: articleData.slug || null,
              url: articleData.url || null
            }
          }
        },
        { status: 400 }
      );
    }

    const articlesDir = path.join(process.cwd(), 'articles');
    
    try {
      await fs.access(articlesDir);
    } catch {
      await fs.mkdir(articlesDir, { recursive: true });
    }

    const frontmatter = generateFrontmatter(articleData);
    const fullContent = `${frontmatter}\n\n${articleData.content}`;

    const filePath = path.join(articlesDir, `${articleData.slug}.md`);
    
    let finalPath = filePath;
    let counter = 1;
    while (true) {
      try {
        await fs.access(finalPath);
        finalPath = path.join(articlesDir, `${articleData.slug}-${counter}.md`);
        counter++;
      } catch {
        break;
      }
    }

    await fs.writeFile(finalPath, fullContent, 'utf-8');

    const relativePath = path.relative(process.cwd(), finalPath);

    return NextResponse.json({
      success: true,
      data: {
        path: relativePath,
        slug: path.basename(finalPath, '.md'),
        url: `/${path.basename(finalPath, '.md')}`
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