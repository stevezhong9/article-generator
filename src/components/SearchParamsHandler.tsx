'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { MarketingData } from './MarketingInfo';

interface SearchParamsHandlerProps {
  onUrlParam: (url: string) => void;
  onMarketingData: (data: MarketingData) => void;
  onAutoStart: (url: string, marketingData: MarketingData) => void;
}

export default function SearchParamsHandler({ 
  onUrlParam, 
  onMarketingData, 
  onAutoStart 
}: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  const handleUrlParam = useCallback((url: string) => {
    onUrlParam(url);
  }, [onUrlParam]);

  const handleMarketingData = useCallback((data: MarketingData) => {
    onMarketingData(data);
  }, [onMarketingData]);

  const handleAutoStart = useCallback((url: string, marketingData: MarketingData) => {
    onAutoStart(url, marketingData);
  }, [onAutoStart]);

  useEffect(() => {
    if (searchParams) {
      // 检查URL参数中的文章URL
      const paramUrl = searchParams.get('url');
      if (paramUrl) {
        handleUrlParam(paramUrl);
      }

      // 检查营销数据参数
      const marketingData: MarketingData = {};
      const companyName = searchParams.get('company') || searchParams.get('companyName');
      const website = searchParams.get('website') || searchParams.get('site');
      const email = searchParams.get('email') || searchParams.get('contact');
      const phone = searchParams.get('phone') || searchParams.get('tel');
      const logo = searchParams.get('logo');

      if (companyName) marketingData.companyName = companyName;
      if (website) marketingData.website = website;
      if (email) marketingData.email = email;
      if (phone) marketingData.phone = phone;
      if (logo) marketingData.logo = logo;

      if (Object.keys(marketingData).length > 0) {
        handleMarketingData(marketingData);
      }

      // 如果有URL参数且所有必要信息都有，可以自动开始处理
      const autoStart = searchParams.get('auto') === 'true';
      if (paramUrl && autoStart) {
        // 延迟一点时间让组件完全初始化
        setTimeout(() => {
          handleAutoStart(paramUrl, marketingData);
        }, 1000);
      }
    }
  }, [searchParams, handleUrlParam, handleMarketingData, handleAutoStart]);

  return null; // 这是一个逻辑组件，不渲染任何UI
}