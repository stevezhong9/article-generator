import { NextRequest, NextResponse } from 'next/server';
import { scrapeArticle } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    const { url, marketingData } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const articleData = await scrapeArticle(url);
    
    // 添加详细的调试日志
    console.log('=== SCRAPE API DEBUG ===');
    console.log('抓取完成，返回的数据:');
    console.log('- title:', articleData.title ? `"${articleData.title}" (长度: ${articleData.title.length})` : '空');
    console.log('- content:', articleData.content ? `存在 (长度: ${articleData.content.length})` : '空');
    console.log('- slug:', articleData.slug ? `"${articleData.slug}"` : '空');
    console.log('- url:', articleData.url ? `"${articleData.url}"` : '空');
    console.log('- author:', articleData.author ? `"${articleData.author}"` : '空');
    console.log('- publishDate:', articleData.publishDate ? `"${articleData.publishDate}"` : '空');
    console.log('- description:', articleData.description ? `存在 (长度: ${articleData.description.length})` : '空');
    
    // 验证必需字段
    const issues = [];
    if (!articleData.title || articleData.title.trim() === '') issues.push('title为空');
    if (!articleData.content || articleData.content.trim() === '') issues.push('content为空');
    if (!articleData.slug || articleData.slug.trim() === '') issues.push('slug为空');
    
    if (issues.length > 0) {
      console.log('警告: 抓取的数据存在问题:', issues.join(', '));
    }

    return NextResponse.json({
      success: true,
      data: {
        ...articleData,
        marketingData: marketingData || null
      }
    });

  } catch (error) {
    console.error('API scrape error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to scrape article',
        success: false
      },
      { status: 500 }
    );
  }
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}