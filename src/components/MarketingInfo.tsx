'use client';

import { useState, useEffect } from 'react';

export interface MarketingData {
  logo?: string;
  companyName?: string;
  website?: string;
  email?: string;
  phone?: string;
}

interface MarketingInfoProps {
  onUpdate: (data: MarketingData) => void;
  initialCollapsed?: boolean;
}

export default function MarketingInfo({ onUpdate, initialCollapsed = true }: MarketingInfoProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [formData, setFormData] = useState<MarketingData>({});
  const [logoPreview, setLogoPreview] = useState<string>('');

  // 从 localStorage 加载已保存的营销信息
  useEffect(() => {
    const savedData = localStorage.getItem('marketing-info');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setLogoPreview(parsed.logo || '');
        
        // 如果有保存的数据，默认展开
        if (Object.keys(parsed).length > 0 && Object.values(parsed).some(v => v)) {
          setCollapsed(false);
        }
        
        // 通知父组件
        onUpdate(parsed);
      } catch (error) {
        console.error('加载营销信息失败:', error);
      }
    }
  }, []); // 移除 onUpdate 依赖，只在组件挂载时执行一次

  const handleInputChange = (field: keyof MarketingData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // 保存到 localStorage
    localStorage.setItem('marketing-info', JSON.stringify(newData));
    
    // 通知父组件
    onUpdate(newData);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo 文件大小不能超过 2MB');
        return;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setLogoPreview(base64);
        handleInputChange('logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview('');
    handleInputChange('logo', '');
  };

  const hasData = Object.values(formData).some(v => v);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <span className="text-2xl mr-2">🚀</span>
            <h3 className="text-lg font-semibold text-blue-900">
              营销推广信息 {hasData && <span className="text-sm text-blue-600">(已填写)</span>}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center text-blue-700">
          <span className="text-sm mr-2">{collapsed ? '展开' : '收起'}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
            💡 <strong>提示:</strong> 填写营销推广信息后，生成的文章页面将显示您的品牌Logo和联系方式，有助于品牌推广和用户联系。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo 上传 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品牌 Logo
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    支持 JPG、PNG 格式，文件大小不超过 2MB
                  </p>
                </div>
                
                {logoPreview && (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo预览" 
                      className="w-16 h-16 object-contain border border-gray-200 rounded-md bg-white"
                    />
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 公司/品牌名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司/品牌名称
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="例：科技创新公司"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 官网链接 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                官网链接
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系邮箱
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 电话 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系电话
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="400-123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {hasData && (
            <div className="flex items-center text-green-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              营销推广信息已保存，将在文章页面中展示
            </div>
          )}
        </div>
      )}
    </div>
  );
}