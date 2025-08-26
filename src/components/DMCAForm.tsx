'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DMCAFormProps {
  articleId?: string;
  articleUrl?: string;
  onClose: () => void;
}

export default function DMCAForm({ articleId, articleUrl, onClose }: DMCAFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    article_id: articleId || '',
    reporter_name: '',
    reporter_email: '',
    reporter_organization: '',
    copyright_owner: '',
    infringement_description: '',
    original_work_description: '',
    infringing_urls: [articleUrl || ''],
    contact_address: '',
    phone_number: '',
    good_faith_statement: '',
    accuracy_statement: '',
    authorization_statement: '',
    electronic_signature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addUrlField = () => {
    setFormData(prev => ({
      ...prev,
      infringing_urls: [...prev.infringing_urls, '']
    }));
  };

  const removeUrlField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      infringing_urls: prev.infringing_urls.filter((_, i) => i !== index)
    }));
  };

  const updateUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      infringing_urls: prev.infringing_urls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/copyright/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          infringing_urls: formData.infringing_urls.filter(url => url.trim() !== '')
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit DMCA report');
      }
    } catch (error) {
      console.error('DMCA form submission error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">DMCA通知已提交 / DMCA Notice Submitted</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                您的版权侵权报告已成功提交。我们的团队将在24小时内审核并采取相应行动。
              </p>
              <p className="text-gray-600">
                <em>Your copyright infringement report has been submitted successfully. Our team will review and take appropriate action within 24 hours.</em>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">后续步骤 / Next Steps</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 我们将在24小时内审核您的报告</li>
                  <li>• 如果报告有效，相关内容将被立即移除</li>
                  <li>• 您将收到电子邮件状态更新</li>
                  <li>• We will review your report within 24 hours</li>
                  <li>• If valid, the reported content will be removed immediately</li>
                  <li>• You will receive email status updates</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="btn-brand-primary"
              >
                关闭 / Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                DMCA版权侵权通知 / DMCA Copyright Infringement Notice
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">重要提醒 / Important Notice</h3>
            <p className="text-sm text-yellow-800">
              根据DMCA法案，提交虚假版权声明可能面临法律后果。请确保您的声明准确且出于善意。
              <br />
              <em>Under the DMCA, submitting false copyright claims may result in legal consequences. Please ensure your claims are accurate and made in good faith.</em>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reporter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">举报人信息 / Reporter Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 / Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reporter_name}
                  onChange={(e) => handleInputChange('reporter_name', e.target.value)}
                  className="input-brand w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电子邮箱 / Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.reporter_email}
                  onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                  className="input-brand w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  组织/公司 / Organization (Optional)
                </label>
                <input
                  type="text"
                  value={formData.reporter_organization}
                  onChange={(e) => handleInputChange('reporter_organization', e.target.value)}
                  className="input-brand w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系地址 / Contact Address
                </label>
                <textarea
                  value={formData.contact_address}
                  onChange={(e) => handleInputChange('contact_address', e.target.value)}
                  rows={3}
                  className="input-brand w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电话号码 / Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="input-brand w-full"
                />
              </div>
            </div>

            {/* Copyright Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">版权信息 / Copyright Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  版权所有者 / Copyright Owner *
                </label>
                <input
                  type="text"
                  required
                  value={formData.copyright_owner}
                  onChange={(e) => handleInputChange('copyright_owner', e.target.value)}
                  className="input-brand w-full"
                  placeholder="如果不是您本人，请填写版权所有者姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原创作品描述 / Description of Original Work *
                </label>
                <textarea
                  required
                  value={formData.original_work_description}
                  onChange={(e) => handleInputChange('original_work_description', e.target.value)}
                  rows={4}
                  className="input-brand w-full"
                  placeholder="请描述被侵权的原创作品，包括发表时间、地点等信息"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  侵权内容描述 / Description of Infringement *
                </label>
                <textarea
                  required
                  value={formData.infringement_description}
                  onChange={(e) => handleInputChange('infringement_description', e.target.value)}
                  rows={4}
                  className="input-brand w-full"
                  placeholder="请详细描述侵权行为和侵权内容"
                />
              </div>
            </div>
          </div>

          {/* Infringing URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              涉嫌侵权的URL / Infringing URLs *
            </label>
            {formData.infringing_urls.map((url, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className="input-brand flex-1"
                  placeholder="https://example.com/infringing-content"
                />
                {formData.infringing_urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrlField(index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addUrlField}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 添加更多URL / Add More URLs
            </button>
          </div>

          {/* Legal Statements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">法律声明 / Legal Statements</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                善意声明 / Good Faith Statement *
              </label>
              <textarea
                required
                value={formData.good_faith_statement}
                onChange={(e) => handleInputChange('good_faith_statement', e.target.value)}
                rows={3}
                className="input-brand w-full"
                placeholder="我真诚相信对争议材料的使用未获得版权所有者、其代理人或法律的授权。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                准确性声明 / Accuracy Statement *
              </label>
              <textarea
                required
                value={formData.accuracy_statement}
                onChange={(e) => handleInputChange('accuracy_statement', e.target.value)}
                rows={3}
                className="input-brand w-full"
                placeholder="我声明本通知中的信息是准确的。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                授权声明 / Authorization Statement *
              </label>
              <textarea
                required
                value={formData.authorization_statement}
                onChange={(e) => handleInputChange('authorization_statement', e.target.value)}
                rows={3}
                className="input-brand w-full"
                placeholder="在伪证罪的惩罚下，我声明我有权代表所声称被侵犯的专有权利的所有者行事。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                电子签名 / Electronic Signature *
              </label>
              <input
                type="text"
                required
                value={formData.electronic_signature}
                onChange={(e) => handleInputChange('electronic_signature', e.target.value)}
                className="input-brand w-full"
                placeholder="请输入您的全名作为电子签名"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消 / Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中... / Submitting...' : '提交DMCA通知 / Submit DMCA Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}