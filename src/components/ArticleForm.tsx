'use client';

import { useState } from 'react';

interface ArticleFormProps {
  onSubmit: (url: string, customPath?: string) => void;
  loading: boolean;
}

export default function ArticleForm({ onSubmit, loading }: ArticleFormProps) {
  const [url, setUrl] = useState('');
  const [customPath, setCustomPath] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), customPath.trim() || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          文章 URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="customPath" className="block text-sm font-medium text-gray-700 mb-2">
          自定义路径 (可选)
        </label>
        <input
          type="text"
          id="customPath"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          placeholder="my-custom-article-path"
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          如果不填写，系统会根据文章标题自动生成路径
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? '抓取中...' : '抓取文章'}
      </button>
    </form>
  );
}