'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import ArticleForm from '@/components/ArticleForm';
import ArticlePreview from '@/components/ArticlePreview';
import ArticleShareModal from '@/components/ArticleShareModal';
import { ArticleData } from '@/lib/scraper';
import { MarketingData } from '@/components/MarketingInfo';
import SearchParamsHandler from '@/components/SearchParamsHandler';

export default function Home() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ path: string; url: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string>('');
  const [showClipboardPrompt, setShowClipboardPrompt] = useState(false);
  const [urlParamUrl, setUrlParamUrl] = useState<string>('');
  const [initialMarketingData, setInitialMarketingData] = useState<MarketingData>({});

  // 处理URL参数的回调函数
  const handleUrlParam = (url: string) => {
    setUrlParamUrl(url);
    // 如果有URL参数，不显示剪贴板提示
    setShowClipboardPrompt(false);
    setClipboardUrl('');
  };

  const handleMarketingDataParam = (marketingData: MarketingData) => {
    setInitialMarketingData(marketingData);
  };

  const handleAutoStart = (url: string, marketingData: MarketingData) => {
    handleScrape(url, marketingData);
  };

  // 检测剪贴板URL
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // 只在非文章状态时检测剪贴板
        if (article || saved) return;

        // 检查是否支持 clipboard API
        if (!navigator.clipboard || !navigator.clipboard.readText) return;

        const clipboardText = await navigator.clipboard.readText();
        
        // 检查是否为URL格式
        const urlRegex = /^https?:\/\/[^\s]+$/;
        if (urlRegex.test(clipboardText.trim())) {
          const url = clipboardText.trim();
          
          // 避免重复提示同一个URL
          if (url !== clipboardUrl) {
            setClipboardUrl(url);
            setShowClipboardPrompt(true);
          }
        }
      } catch (error) {
        // 用户可能拒绝了剪贴板访问权限，静默处理
        console.log('无法访问剪贴板:', error);
      }
    };

    // 页面加载时检测一次
    checkClipboard();

    // 每3秒检测一次剪贴板变化
    const interval = setInterval(checkClipboard, 3000);

    return () => clearInterval(interval);
  }, [article, saved, clipboardUrl]);

  const handleClipboardConfirm = () => {
    setShowClipboardPrompt(false);
    // 这里会触发ArticleForm重新渲染并填入URL
  };

  const handleClipboardCancel = () => {
    setShowClipboardPrompt(false);
    setClipboardUrl('');
  };

  const handleScrape = async (url: string, marketingData?: MarketingData) => {
    setLoading(true);
    setError(null);
    setSaved(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, marketingData }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('主页 - 收到的文章数据:', {
          title: result.data.title,
          hasMarketingData: !!result.data.marketingData,
          marketingData: result.data.marketingData
        });
        
        setArticle(result.data);
        
        // 文章抓取成功后，自动保存以获取时间戳URL，然后显示分享对话框
        setTimeout(async () => {
          try {
            await handleSave(result.data);
            // 保存完成后再显示分享对话框
            setTimeout(() => setShowShareModal(true), 500);
          } catch (error) {
            console.error('自动保存失败:', error);
            // 即使保存失败，也显示分享对话框
            setShowShareModal(true);
          }
        }, 500);
      } else {
        setError(result.error || '抓取失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData: ArticleData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();

      if (result.success) {
        // 文章已保存到服务器，更新文章数据包含finalSlug
        const updatedArticle = {
          ...articleData,
          finalSlug: result.data.slug
        };
        setArticle(updatedArticle);
        
        setSaved({
          path: `服务端存储`,
          url: result.data.url
        });
      } else {
        setError(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setArticle(null);
    setError(null);
    setSaved(null);
    setShowShareModal(false);
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
  };

  // 预生成bookmarklet代码避免重复渲染
  const bookmarkletCode = useMemo(() => {
    return `javascript:(function(){
try{
console.log('一键转发工具启动...');
var t=document.title||document.querySelector('h1')?document.querySelector('h1').textContent||'':'';
if(!t||t.trim()==''){
t=document.querySelector('meta[property="og:title"]')?document.querySelector('meta[property="og:title"]').getAttribute('content')||'':'';
}
if(!t||t.trim()==''){
var h=document.querySelector('h1,h2,h3')?document.querySelector('h1,h2,h3').textContent||'':'';
t=h.substring(0,100);
}
if(!t||t.trim()==''){
t='网页内容';
}
t=t.trim();
console.log('提取的标题:',t);
var u=window.location.href;
var d=document.querySelector('meta[name="description"]');
var desc=d?d.getAttribute('content')||'':'';
var e=document.getElementById('share-popup-bookmarklet');
if(e)e.remove();

// 尝试从localStorage获取营销信息
var savedMarketingData = {};
try {
var saved = localStorage.getItem('marketing-info');
if (saved) savedMarketingData = JSON.parse(saved);
} catch(e) {}

// 创建营销表单弹窗
var p=document.createElement('div');
p.id='share-popup-bookmarklet';
p.style.cssText='position:fixed;top:20px;right:20px;width:380px;max-height:80vh;overflow-y:auto;background:#fff;border:2px solid #007AFF;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

// 营销表单HTML
var formHtml = '<div style="padding:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="margin:0;color:#1f2937;font-size:16px;font-weight:600;">🚀 营销推广信息</h3><button id="closeBtnBookmarklet" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;">×</button></div>';

formHtml += '<div style="margin-bottom:12px;"><div style="font-size:13px;color:#374151;margin-bottom:4px;">📝 ' + t.substring(0,50) + (t.length>50?'...':'') + '</div><div style="font-size:11px;color:#6b7280;">填写营销信息后开始转发</div></div>';

formHtml += '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;color:#374151;margin-bottom:4px;">公司/品牌名称</label><input id="companyName" type="text" placeholder="例：科技创新公司" value="'+(savedMarketingData.companyName||'')+'" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;"/></div>';

formHtml += '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;color:#374151;margin-bottom:4px;">官网链接</label><input id="website" type="url" placeholder="https://example.com" value="'+(savedMarketingData.website||'')+'" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;"/></div>';

formHtml += '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;color:#374151;margin-bottom:4px;">联系邮箱</label><input id="email" type="email" placeholder="contact@example.com" value="'+(savedMarketingData.email||'')+'" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;"/></div>';

formHtml += '<div style="margin-bottom:16px;"><label style="display:block;font-size:12px;color:#374151;margin-bottom:4px;">联系电话</label><input id="phone" type="tel" placeholder="400-123-4567" value="'+(savedMarketingData.phone||'')+'" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;"/></div>';

formHtml += '<button id="startShareBtn" style="width:100%;padding:12px;background:#007AFF;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px;">🚀 开始转发</button>';

formHtml += '<div style="text-align:center;"><a href="https://sharetox.com" target="_blank" style="font-size:11px;color:#6b7280;text-decoration:none;">SharetoX 转载工具</a></div></div>';

p.innerHTML = formHtml;
document.body.appendChild(p);

// 绑定关闭按钮
document.getElementById('closeBtnBookmarklet').onclick=function(){p.remove();};

// 绑定开始转发按钮
document.getElementById('startShareBtn').onclick=function(){
// 收集营销数据
var marketingData = {
companyName: document.getElementById('companyName').value,
website: document.getElementById('website').value,
email: document.getElementById('email').value,
phone: document.getElementById('phone').value
};

// 保存到localStorage
try {
localStorage.setItem('marketing-info', JSON.stringify(marketingData));
} catch(e) {}

// 显示处理中状态
p.innerHTML = '<div style="padding:16px;text-align:center;"><div style="margin-bottom:12px;"><h3 style="margin:0;color:#1f2937;font-size:16px;font-weight:600;">📤 正在处理...</h3></div><div style="margin-bottom:12px;"><div style="font-size:13px;color:#374151;margin-bottom:4px;">📝 ' + t.substring(0,50) + (t.length>50?'...':'') + '</div><div style="font-size:11px;color:#6b7280;">正在生成分享链接...</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><button id="twitterBtnBookmarklet" disabled style="display:flex;align-items:center;justify-content:center;padding:8px;background:#ccc;color:white;border:none;border-radius:6px;font-size:12px;">🐦 Twitter</button><button id="linkedinBtnBookmarklet" disabled style="display:flex;align-items:center;justify-content:center;padding:8px;background:#ccc;color:white;border:none;border-radius:6px;font-size:12px;">💼 LinkedIn</button></div></div>';

// 开始保存和分享流程
saveAndShare(marketingData);
};

function saveAndShare(marketingData){
console.log('正在保存文章到SharetoX...');
var content=document.body.innerHTML.substring(0,5000);

// 生成slug
function generateSlug(title){
var s=title.toLowerCase().trim();
// 简化的关键词提取
var words=s.split(/[\\s\\-\\_\\.\\,\\;\\:\\!\\?\\(\\)\\[\\]\\{\\}\\/\\\\\"\\\']+/);
var extractedKeywords=[];
for(var i=0;i<words.length;i++){
var word=words[i];
if(word.length>1){
if(word.match(/^[a-z]+$/)){
extractedKeywords.push(word);
} else {
// 简单的中文转拼音（只处理常见字符）
var pinyin = word.replace(/[\\u4e00-\\u9fff]/g, function(char) {
var map = {'中':'zhong','国':'guo','人':'ren','工':'gong','智':'zhi','能':'neng','技':'ji','术':'shu','文':'wen','章':'zhang','新':'xin','科':'ke','学':'xue','公':'gong','司':'si','产':'chan','品':'pin','网':'wang','站':'zhan','系':'xi','统':'tong','平':'ping','台':'tai','数':'shu','据':'ju','应':'ying','用':'yong'};
return map[char] || char;
});
if(pinyin !== word) extractedKeywords.push(pinyin);
}
}
}
var keywordSlug = extractedKeywords.slice(0,3).join('-');
return (keywordSlug || 'article') + '-' + Date.now();
}

var slug = generateSlug(t);

fetch('https://sharetox.com/api/save',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
url:u,
title:t,
content:'<p>'+desc+'</p><div>'+content+'</div>',
slug:slug,
description:desc,
marketingData: marketingData
})
}).then(function(r){return r.json();}).then(function(data){
console.log('保存结果:',data);
if(data.success){
var shareUrl='https://sharetox.com'+data.data.url;
var twitterText=encodeURIComponent('📄 '+t+' '+shareUrl);
var linkedinUrl=encodeURIComponent(shareUrl);

// 更新分享按钮
document.getElementById('twitterBtnBookmarklet').disabled=false;
document.getElementById('twitterBtnBookmarklet').style.background='#1DA1F2';
document.getElementById('twitterBtnBookmarklet').style.cursor='pointer';
document.getElementById('twitterBtnBookmarklet').onclick=function(){window.open('https://twitter.com/intent/tweet?text='+twitterText,'_blank');};

document.getElementById('linkedinBtnBookmarklet').disabled=false;
document.getElementById('linkedinBtnBookmarklet').style.background='#0077B5';  
document.getElementById('linkedinBtnBookmarklet').style.cursor='pointer';
document.getElementById('linkedinBtnBookmarklet').onclick=function(){window.open('https://www.linkedin.com/sharing/share-offsite/?url='+linkedinUrl,'_blank');};

console.log('分享链接已生成:',shareUrl);
}else{
console.error('保存失败:',data.error);
var fallbackTwitter=encodeURIComponent('📄 '+t+' '+u);
document.getElementById('twitterBtnBookmarklet').onclick=function(){window.open('https://twitter.com/intent/tweet?text='+fallbackTwitter,'_blank');};
document.getElementById('linkedinBtnBookmarklet').onclick=function(){window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(u),'_blank');};
}
}).catch(function(err){
console.error('保存请求失败:',err);
var fallbackTwitter=encodeURIComponent('📄 '+t+' '+u);
document.getElementById('twitterBtnBookmarklet').onclick=function(){window.open('https://twitter.com/intent/tweet?text='+fallbackTwitter,'_blank');};
document.getElementById('linkedinBtnBookmarklet').onclick=function(){window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(u),'_blank');};
});
}

// 自动关闭弹窗
setTimeout(function(){if(document.body.contains(p))p.remove();},30000);
console.log('一键转发工具加载完成');
}catch(err){
console.error('Bookmarklet error:',err);
alert('一键转发工具加载失败: '+err.message);
}
})();`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      {/* URL参数处理组件 */}
      <Suspense fallback={null}>
        <SearchParamsHandler
          onUrlParam={handleUrlParam}
          onMarketingData={handleMarketingDataParam}
          onAutoStart={handleAutoStart}
        />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <div className="text-6xl font-bold text-gray-900 mb-6">
            SharetoX ✨
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent mb-4">
            一键转发助手
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            一键转发网页/内容，生成自主品牌长图和网页，分享至社交媒体，赢得更多获客机会！
          </p>
        </header>

        {error && (
          <div className="mb-8 bg-red-50/70 border border-red-200/60 rounded-xl p-4 max-w-4xl mx-auto">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  ❌ 处理失败
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800 mb-3">
                  🎉 文章保存成功！
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">本地文件：</span> 
                      <code className="bg-green-100 px-2 py-1 rounded font-mono text-xs">{saved.path}</code>
                    </p>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <p><span className="font-medium">在线访问：</span></p>
                    <div className="mt-1 flex items-center space-x-3">
                      <a
                        href={saved.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        查看文章
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + saved.url);
                          alert('链接已复制到剪贴板！');
                        }}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制链接
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      链接地址: <code className="bg-green-100 px-1 py-0.5 rounded font-mono">{window.location.origin + saved.url}</code>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-green-200">
                  <button
                    onClick={handleReset}
                    className="text-sm text-green-800 hover:text-green-900 font-medium underline transition-colors duration-200"
                  >
                    继续转载更多文章 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 剪贴板URL提示 */}
        {showClipboardPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
              <div className="text-center mb-4">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  检测到剪贴板中的URL
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  是否使用此链接进行转发？
                </p>
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <code className="text-xs text-gray-700 break-all">
                    {clipboardUrl}
                  </code>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClipboardCancel}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClipboardConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  确认使用
                </button>
              </div>
            </div>
          </div>
        )}

        {!article && !saved && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 左侧：网址表单 - 2/3 宽度 */}
            <div className="lg:col-span-2">
              <div className="w-full">
                <ArticleForm 
                  onSubmit={handleScrape} 
                  loading={loading} 
                  initialUrl={urlParamUrl || (showClipboardPrompt ? '' : clipboardUrl)} 
                  initialMarketingData={initialMarketingData}
                />
              </div>
            </div>
            
            {/* 右侧：一键转发书签工具 - 1/3 宽度 */}
            <div className="lg:col-span-1">
              <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">🔖 一键转发书签</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    拖拽下方按钮到浏览器书签栏，或点击复制代码手动添加。在任何网页上都能一键转发文章到社交媒体
                  </p>
                  
                  
                  <div className="flex justify-center mb-4">
                    <a
                      ref={(el) => {
                        if (el) el.href = bookmarkletCode;
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 cursor-move text-sm select-none"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', bookmarkletCode);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        // 创建bookmarklet链接并复制到剪贴板
                        navigator.clipboard.writeText(bookmarkletCode).then(() => {
                          alert('书签代码已复制到剪贴板！\n\n请按以下步骤操作：\n1. 在浏览器中添加新书签\n2. 将剪贴板内容粘贴为书签地址\n3. 保存书签\n\n💡 提示：您也可以直接拖拽此按钮到浏览器书签栏！');
                        });
                      }}
                      title="拖拽到书签栏或点击复制代码"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      🔖 一键转发
                    </a>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="flex items-start">
                        <span className="font-medium mr-1">方式1:</span>
                        <span>直接拖拽按钮到浏览器书签栏</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium mr-1">方式2:</span>
                        <span>点击按钮复制代码，手动添加书签</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium mr-1">使用:</span>
                        <span>在任意网页点击书签即可转发</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 space-y-2">
                        <div className="font-medium text-gray-700">💡 URL传参功能：</div>
                        <div className="text-xs font-mono bg-gray-50 p-2 rounded text-gray-600">
                          ?url=文章链接&company=公司名&auto=true
                        </div>
                        <div className="text-xs text-gray-500">
                          支持参数：url, company, website, email, phone, auto
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {article && !showShareModal && (
          <ArticlePreview
            article={article}
            onSave={handleSave}
            onEdit={handleReset}
            loading={loading}
          />
        )}
      </div>

      {/* 文章分享对话框 */}
      {article && (
        <ArticleShareModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          article={article}
        />
      )}
    </div>
  );
}
