'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function AuthPopupContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const errorParam = searchParams.get('error');

    // 如果有错误参数，直接处理
    if (errorParam) {
      const errorMessage = decodeURIComponent(errorParam);
      setError(errorMessage);
      
      // 通知父窗口登录失败
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({
            type: 'AUTH_ERROR',
            error: errorMessage
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } catch (e) {
          console.error('Cannot communicate with parent window:', e);
        }
      }
      return;
    }

    // 处理成功登录
    if (status === 'authenticated' && session?.user) {
      console.log('Authentication successful in popup');
      
      // 通知父窗口登录成功
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            user: session.user,
            callbackUrl
          }, window.location.origin);
          
          // 延迟关闭窗口，确保消息被处理
          setTimeout(() => window.close(), 500);
        } catch (e) {
          console.error('Cannot communicate with parent window:', e);
          // 如果无法通信，直接跳转
          window.location.href = callbackUrl;
        }
      } else {
        // 如果没有父窗口或父窗口已关闭，直接跳转
        window.location.href = callbackUrl;
      }
    }
    
    // 处理加载状态超时
    if (status === 'loading') {
      const timeout = setTimeout(() => {
        console.log('Authentication timeout in popup');
        setError('登录超时，请重试');
      }, 10000); // 10秒超时
      
      return () => clearTimeout(timeout);
    }
    
  }, [session, status, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">正在验证登录状态...</h2>
              <p className="text-sm text-gray-600">请稍候</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">登录失败</h2>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.close()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">登录成功</h2>
            <p className="text-sm text-gray-600">正在关闭窗口...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPopupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">加载中...</h2>
              <p className="text-sm text-gray-600">请稍候</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthPopupContent />
    </Suspense>
  );
}