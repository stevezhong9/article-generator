'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CopyrightComplianceProps {
  sourceUrl?: string;
  onConfirm: (attribution: { hasPermission: boolean; sourceUrl?: string; originalAuthor?: string }) => void;
  onCancel: () => void;
}

export default function CopyrightCompliance({ sourceUrl, onConfirm, onCancel }: CopyrightComplianceProps) {
  const t = useTranslations();
  const [hasPermission, setHasPermission] = useState(false);
  const [sourceUrlInput, setSourceUrlInput] = useState(sourceUrl || '');
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [contentType, setContentType] = useState<'original' | 'fair-use' | 'public-domain' | 'licensed'>('original');

  const handleConfirm = () => {
    onConfirm({
      hasPermission,
      sourceUrl: sourceUrlInput,
      originalAuthor
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">版权合规确认 / Copyright Compliance</h2>
          </div>
          <p className="text-gray-600">
            请确认您对此内容拥有合法使用权限 / Please confirm you have legal rights to use this content
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              内容类型 / Content Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="original"
                  checked={contentType === 'original'}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="mr-3"
                />
                <span className="text-sm">我是原作者 / I am the original author</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="public-domain"
                  checked={contentType === 'public-domain'}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="mr-3"
                />
                <span className="text-sm">公共领域内容 / Public domain content</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="licensed"
                  checked={contentType === 'licensed'}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="mr-3"
                />
                <span className="text-sm">已获得授权使用 / I have permission to use</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="fair-use"
                  checked={contentType === 'fair-use'}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="mr-3"
                />
                <span className="text-sm">合理使用/引用 / Fair use/Citation</span>
              </label>
            </div>
          </div>

          {/* Source URL */}
          {(contentType === 'licensed' || contentType === 'fair-use') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原始来源链接 / Source URL
              </label>
              <input
                type="url"
                value={sourceUrlInput}
                onChange={(e) => setSourceUrlInput(e.target.value)}
                placeholder="https://example.com/original-content"
                className="input-brand w-full"
              />
            </div>
          )}

          {/* Original Author */}
          {contentType !== 'original' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原作者署名 / Original Author
              </label>
              <input
                type="text"
                value={originalAuthor}
                onChange={(e) => setOriginalAuthor(e.target.value)}
                placeholder="Author name or organization"
                className="input-brand w-full"
              />
            </div>
          )}

          {/* Legal Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">重要法律声明 / Important Legal Notice</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• 您需对上传/分享的内容承担全部法律责任</p>
              <p>• You are fully responsible for the content you upload/share</p>
              <p>• 未经授权使用受版权保护的内容可能面临法律后果</p>
              <p>• Unauthorized use of copyrighted content may result in legal consequences</p>
              <p>• 平台仅提供技术服务，不承担内容相关法律责任</p>
              <p>• The platform only provides technical services and assumes no legal responsibility for content</p>
            </div>
          </div>

          {/* Compliance Guidelines */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">合规指引 / Compliance Guidelines</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>自己创作的原创内容 / Original content you created</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>公共领域(CC0/公版)内容 / Public domain (CC0) content</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>已获得授权的内容 / Content with proper licensing</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-500 font-bold">⚠</span>
                <span>新闻报道的合理引用 / Fair use of news content</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✗</span>
                <span>未经授权的受版权保护内容 / Unauthorized copyrighted content</span>
              </div>
            </div>
          </div>

          {/* Final Confirmation */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={hasPermission}
                onChange={(e) => setHasPermission(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                我确认拥有使用此内容的合法权限，并同意承担相关法律责任。如果内容涉及版权问题，我将配合处理相关投诉。
                <br />
                <em>I confirm that I have legal rights to use this content and agree to bear related legal responsibilities. If copyright issues arise, I will cooperate with related complaints.</em>
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasPermission}
            className="btn-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认继续 / Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
}