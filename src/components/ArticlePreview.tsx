import { ArticleData } from '@/lib/scraper';

interface ArticlePreviewProps {
  article: ArticleData;
  onSave: (article: ArticleData) => void;
  onEdit: () => void;
  loading: boolean;
}

export default function ArticlePreview({ article, onSave, onEdit, loading }: ArticlePreviewProps) {
  const handleSave = () => {
    onSave(article);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {article.author && (
            <div>
              <span className="font-medium">作者:</span> {article.author}
            </div>
          )}
          {article.publishDate && (
            <div>
              <span className="font-medium">发布时间:</span> {new Date(article.publishDate).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
        {article.description && (
          <p className="mt-2 text-gray-700">{article.description}</p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            生成的路径:
          </label>
          <div className="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm">
            /{article.slug}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            原文链接:
          </label>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
          >
            {article.url}
          </a>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">内容预览:</h3>
        <div 
          className="prose prose-sm max-w-none text-gray-700 max-h-96 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: article.content.substring(0, 1000) + (article.content.length > 1000 ? '...' : '') }}
        />
        {article.content.length > 1000 && (
          <p className="text-xs text-gray-500 mt-2">
            预览已截断，完整内容将保存到文章中
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={onEdit}
          disabled={loading}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          重新抓取
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : '保存文章'}
        </button>
      </div>
    </div>
  );
}