import { NextRequest, NextResponse } from 'next/server';

// 本地测试API - 模拟文章抓取功能
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    console.log('本地测试模式 - 模拟抓取URL:', url);
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据URL生成模拟数据
    const mockData = {
      title: `测试文章标题 - ${new Date().toLocaleString()}`,
      description: `这是从 ${url} 抓取的模拟文章描述。本地测试模式，无需真实网络请求。`,
      content: `
        <div class="article-content">
          <h1>测试文章标题</h1>
          <p>这是一篇用于测试一键转发功能的模拟文章。</p>
          <p>URL: ${url}</p>
          <p>生成时间: ${new Date().toLocaleString()}</p>
          <h2>文章内容示例</h2>
          <p>这里是文章的主要内容。在实际使用中，这里会是从目标网页抓取的真实内容。</p>
          <ul>
            <li>支持HTML格式内容</li>
            <li>保持原文结构和排版</li>
            <li>自动提取标题和描述</li>
            <li>添加营销推广信息</li>
          </ul>
          <blockquote>
            <p>本地测试模式：所有数据均为模拟生成，用于验证功能流程。</p>
          </blockquote>
        </div>
      `,
      author: '测试作者',
      publish_date: new Date().toISOString(),
      source_url: url,
      image_url: null,
      slug: `test-article-${Date.now()}`,
      success: true
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: '本地测试模式 - 模拟抓取成功'
    });
    
  } catch (error) {
    console.error('本地测试API错误:', error);
    return NextResponse.json({
      success: false,
      error: '本地测试模式错误',
      message: '模拟错误场景'
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '本地测试API - 文章抓取模拟端点',
    usage: 'POST with { "url": "https://example.com/article" }',
    mode: 'local_test'
  });
}