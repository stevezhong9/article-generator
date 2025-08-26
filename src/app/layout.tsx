import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "@/styles/brand-colors.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '文章转载工具 - 一键转载网络文章，生成精美页面',
  description: '专业的文章转载工具，支持一键抓取网络文章内容，生成精美的文章页面，支持长图分享和社交媒体推广。',
  keywords: ['文章转载', '内容分享', '长图生成', '社交媒体', '文章抓取', '内容营销'],
  authors: [{ name: '文章转载工具团队' }],
  creator: '文章转载工具',
  publisher: '文章转载工具',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app',
    siteName: '文章转载工具',
    title: '文章转载工具 - 一键转载网络文章，生成精美页面',
    description: '专业的文章转载工具，支持一键抓取网络文章内容，生成精美的文章页面，支持长图分享和社交媒体推广。',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: '文章转载工具 - 一键转载网络文章，生成精美页面',
    description: '专业的文章转载工具，支持一键抓取网络文章内容，生成精美的文章页面，支持长图分享和社交媒体推广。',
  },

  // 其他SEO设置
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

  // App 相关
  applicationName: '文章转载工具',
  category: '效率工具',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* 预连接到外部域名 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 基础结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '文章转载工具',
              description: '专业的文章转载工具，支持一键抓取网络文章内容，生成精美的文章页面。',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
                availability: 'https://schema.org/InStock'
              },
              author: {
                '@type': 'Organization',
                name: '文章转载工具团队'
              },
              inLanguage: 'zh-CN',
              datePublished: '2024-01-01',
              dateModified: new Date().toISOString().split('T')[0]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
