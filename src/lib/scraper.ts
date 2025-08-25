import axios from 'axios';
import * as cheerio from 'cheerio';
import slugify from 'slugify';

export interface MarketingData {
  logo?: string;
  companyName?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface ArticleData {
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
  description?: string;
  url: string;
  slug: string;
  finalSlug?: string;
  marketingData?: MarketingData | null;
}

export async function scrapeArticle(url: string): Promise<ArticleData> {
  try {
    console.log('=== SCRAPER DEBUG ===');
    console.log('开始抓取URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    console.log('HTTP响应状态:', response.status);
    console.log('响应内容长度:', response.data.length);

    const $ = cheerio.load(response.data);

    const title = extractTitle($);
    console.log('提取的标题:', title ? `"${title}" (长度: ${title.length})` : '未找到');
    
    const content = extractContent($);
    console.log('提取的内容:', content ? `存在 (长度: ${content.length})` : '未找到');
    
    const author = extractAuthor($);
    console.log('提取的作者:', author ? `"${author}"` : '未找到');
    
    const publishDate = extractPublishDate($);
    console.log('提取的发布日期:', publishDate ? `"${publishDate}"` : '未找到');
    
    const description = extractDescription($);
    console.log('提取的描述:', description ? `存在 (长度: ${description.length})` : '未找到');

    const slug = generateSlug(title);
    console.log('生成的slug:', slug ? `"${slug}"` : '生成失败');

    // 验证必需字段，提供备用值
    const finalTitle = title && title.trim() ? title.trim() : 'Untitled Article';
    const finalContent = content && content.trim() ? content.trim() : 'No content available';
    const finalSlug = slug && slug.trim() ? slug.trim() : 'untitled-' + Date.now();
    
    console.log('最终数据验证:');
    console.log('- 最终标题:', finalTitle);
    console.log('- 最终内容长度:', finalContent.length);
    console.log('- 最终slug:', finalSlug);

    return {
      title: finalTitle,
      content: finalContent,
      author,
      publishDate,
      description,
      url,
      slug: finalSlug
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTitle($: cheerio.CheerioAPI): string {
  const selectors = [
    'h1',
    '.title',
    '.article-title',
    '.post-title',
    '[data-testid="headline"]',
    'title'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim()) {
      return element.text().trim();
    }
  }

  return 'Untitled Article';
}

function extractContent($: cheerio.CheerioAPI): string {
  console.log('开始提取内容...');
  
  // 移除不需要的元素
  $('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation, .advertisement, .ads, .social-share').remove();

  const selectors = [
    '.article-content',
    '.post-content',
    '.content',
    '.entry-content',
    '.article-body',
    '.post-body',
    '[data-testid="article-content"]',
    'main article',
    'main',
    '.main-content',
    'article',
    '.post',
    '.entry'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    const text = element.text().trim();
    console.log(`尝试选择器 "${selector}":`, text ? `找到内容 (${text.length} 字符)` : '未找到内容');
    
    if (element.length && text && text.length > 100) { // 确保内容足够长
      const cleaned = cleanContent(element.html() || '');
      console.log('清理后的内容长度:', cleaned.length);
      return cleaned;
    }
  }

  // 如果上述选择器都没找到内容，尝试从所有段落中提取
  const paragraphs = $('p');
  console.log('找到段落数量:', paragraphs.length);
  
  if (paragraphs.length > 0) {
    let combinedContent = '';
    paragraphs.each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) { // 过滤掉太短的段落
        combinedContent += '<p>' + text + '</p>\n';
      }
    });
    
    if (combinedContent.trim()) {
      console.log('从段落组合的内容长度:', combinedContent.length);
      return combinedContent;
    }
  }

  // 最后尝试获取body文本
  const bodyText = $('body').text().trim();
  console.log('body文本长度:', bodyText.length);
  
  if (bodyText.length > 200) {
    return bodyText.substring(0, 2000) + (bodyText.length > 2000 ? '...' : '');
  }
  
  return 'No content found';
}

function extractAuthor($: cheerio.CheerioAPI): string | undefined {
  const selectors = [
    '.author',
    '.byline',
    '[data-testid="author"]',
    '.article-author',
    '.post-author',
    '[rel="author"]'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim()) {
      return element.text().trim();
    }
  }

  const metaAuthor = $('meta[name="author"]').attr('content');
  if (metaAuthor) return metaAuthor;

  return undefined;
}

function extractPublishDate($: cheerio.CheerioAPI): string | undefined {
  const selectors = [
    '.date',
    '.publish-date',
    '.article-date',
    '.post-date',
    '[data-testid="date"]',
    'time'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const datetime = element.attr('datetime') || element.text().trim();
      if (datetime) return datetime;
    }
  }

  const metaDate = $('meta[property="article:published_time"]').attr('content') ||
                  $('meta[name="date"]').attr('content');
  if (metaDate) return metaDate;

  return undefined;
}

function extractDescription($: cheerio.CheerioAPI): string | undefined {
  const metaDescription = $('meta[name="description"]').attr('content') ||
                         $('meta[property="og:description"]').attr('content');
  if (metaDescription) return metaDescription;

  const firstParagraph = $('p').first().text().trim();
  if (firstParagraph && firstParagraph.length > 50) {
    return firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
  }

  return undefined;
}

function cleanContent(html: string): string {
  const $ = cheerio.load(html);
  
  $('script, style, iframe, object, embed').remove();
  $('[style*="display: none"], [style*="display:none"]').remove();
  
  $('*').each((_, el) => {
    const $el = $(el);
    if (el.type === 'tag' && el.attribs) {
      const attrs = el.attribs;
      
      Object.keys(attrs).forEach(attr => {
        if (!['href', 'src', 'alt', 'title'].includes(attr)) {
          $el.removeAttr(attr);
        }
      });
    }
  });

  return $.html();
}

function generateSlug(title: string): string {
  try {
    console.log('开始生成slug，原始标题:', title);
    
    if (!title || title.trim() === '') {
      console.log('标题为空，使用默认slug');
      return 'untitled-' + Date.now();
    }
    
    const slug = slugify(title, {
      lower: true,
      strict: true,
      locale: 'zh',
      remove: /[*+~.()'"!:@]/g
    });
    
    console.log('生成的slug:', slug);
    
    // 确保slug不包含路径分隔符和其他无效字符
    const cleanSlug = slug
      .replace(/[\/\\]/g, '-')  // 替换路径分隔符
      .replace(/[^\w\-\u4e00-\u9fff]/g, '-')  // 只保留字母、数字、中文和连字符
      .replace(/--+/g, '-')  // 合并多个连字符
      .replace(/^-+|-+$/g, ''); // 去除首尾连字符
    
    console.log('清理后的slug:', cleanSlug);
    
    return cleanSlug || 'untitled-' + Date.now();
  } catch (error) {
    console.error('生成slug失败:', error);
    return 'untitled-' + Date.now();
  }
}