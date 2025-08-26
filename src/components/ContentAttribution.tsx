'use client';

import { useTranslations } from 'next-intl';

interface AttributionData {
  sourceUrl?: string;
  originalAuthor?: string;
  contentType: 'original' | 'fair-use' | 'public-domain' | 'licensed';
  generatedAt: string;
  aiGenerated: boolean;
}

interface ContentAttributionProps {
  attribution: AttributionData;
  compact?: boolean;
}

export default function ContentAttribution({ attribution, compact = false }: ContentAttributionProps) {
  const t = useTranslations();
  
  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'original':
        return '原创内容 / Original Content';
      case 'public-domain':
        return '公共领域 / Public Domain';
      case 'licensed':
        return '授权使用 / Licensed Use';
      case 'fair-use':
        return '合理使用 / Fair Use';
      default:
        return '未知类型 / Unknown';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'original':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'public-domain':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'licensed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'fair-use':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <div className={`px-2 py-1 rounded-full border text-xs ${getTypeColor(attribution.contentType)}`}>
          {getContentTypeLabel(attribution.contentType)}
        </div>
        {attribution.aiGenerated && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>AI生成 / AI Generated</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-6">
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <h3 className="font-medium text-gray-900">内容来源信息 / Content Attribution</h3>
      </div>

      <div className="space-y-3">
        {/* Content Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">内容类型 / Content Type:</span>
          <div className={`px-3 py-1 rounded-full border text-sm ${getTypeColor(attribution.contentType)}`}>
            {getContentTypeLabel(attribution.contentType)}
          </div>
        </div>

        {/* Original Author */}
        {attribution.originalAuthor && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">原作者 / Original Author:</span>
            <span className="text-sm font-medium text-gray-900">{attribution.originalAuthor}</span>
          </div>
        )}

        {/* Source URL */}
        {attribution.sourceUrl && (
          <div className="flex items-start justify-between">
            <span className="text-sm text-gray-600">原始来源 / Source:</span>
            <a 
              href={attribution.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline max-w-xs truncate"
            >
              {attribution.sourceUrl}
            </a>
          </div>
        )}

        {/* AI Generated Notice */}
        {attribution.aiGenerated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">处理方式 / Processing:</span>
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
              <span>AI智能生成 / AI Generated</span>
            </div>
          </div>
        )}

        {/* Generation Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">生成时间 / Generated:</span>
          <span className="text-sm text-gray-900">
            {new Date(attribution.generatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          ⚖️ 版权声明：此内容由AI工具基于用户提供的原始材料生成。用户对内容使用权限承担全部责任。
          <br />
          <em>Copyright Notice: This content is generated by AI tools based on user-provided source materials. Users are fully responsible for content usage rights.</em>
        </p>
      </div>

      {/* ShareX AI Watermark */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Generated by ShareX AI</span>
        </div>
        <a 
          href="https://sharex.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          sharex.ai
        </a>
      </div>
    </div>
  );
}