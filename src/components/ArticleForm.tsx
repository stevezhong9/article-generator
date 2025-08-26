'use client';

import { useState, useCallback, useEffect } from 'react';
import MarketingInfo, { MarketingData } from './MarketingInfo';

interface ArticleFormProps {
  onSubmit: (url: string, marketingData?: MarketingData) => void;
  loading: boolean;
  initialUrl?: string;
  initialMarketingData?: MarketingData;
}

export default function ArticleForm({ onSubmit, loading, initialUrl = '', initialMarketingData = {} }: ArticleFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [marketingData, setMarketingData] = useState<MarketingData>(initialMarketingData);

  // Update URL when initialUrl prop changes
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]); // 移除 url 依赖避免无限循环

  // Update marketing data when initialMarketingData prop changes
  useEffect(() => {
    if (Object.keys(initialMarketingData).length > 0) {
      setMarketingData(prev => ({ ...prev, ...initialMarketingData }));
    }
  }, [initialMarketingData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), marketingData);
    }
  };

  const handleMarketingUpdate = useCallback((data: MarketingData) => {
    setMarketingData(data);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <label htmlFor="url" className="block text-base font-semibold text-gray-800 mb-3">
            📋 待转发文章URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴要转发的文章链接，如：https://example.com/article"
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 text-sm placeholder-gray-500 bg-white shadow-sm"
          />
        </div>


      {/* 营销推广信息组件 */}
      <MarketingInfo 
        onUpdate={handleMarketingUpdate} 
        initialData={marketingData}
      />

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          {loading ? '🔄 正在抓取内容...' : '🚀 开始转发'}
        </button>
      </form>
    </div>
  );
}