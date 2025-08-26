'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GoogleLoginPopupProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onLogout?: () => void;
  callbackUrl?: string;
  showUserInfo?: boolean;
}

export default function GoogleLoginPopup({ 
  onSuccess, 
  onError, 
  onLogout,
  callbackUrl = window?.location?.href || '/',
  showUserInfo = true
}: GoogleLoginPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      onSuccess?.();
      setShowPopup(false);
    }
  }, [status, session, onSuccess]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // 检查是否支持弹窗
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      if (isMobile) {
        // 移动端直接跳转
        await signIn('google', { 
          callbackUrl,
          redirect: true 
        });
      } else {
        // 桌面端使用弹窗
        await handlePopupLogin();
      }
    } catch (error) {
      console.error('登录失败:', error);
      onError?.('登录失败，请重试');
      setIsLoading(false);
    }
  };

  const handlePopupLogin = () => {
    return new Promise<void>((resolve, reject) => {
      // 使用 NextAuth 的 signIn 但不重定向
      signIn('google', { 
        redirect: false,
        callbackUrl 
      })
      .then((result) => {
        if (result?.error) {
          reject(result.error);
        } else if (result?.ok) {
          // 登录成功，等待 session 更新
          const checkSession = setInterval(() => {
            if (status === 'authenticated') {
              clearInterval(checkSession);
              resolve();
            }
          }, 500);
          
          // 10秒超时
          setTimeout(() => {
            clearInterval(checkSession);
            if (status !== 'authenticated') {
              reject('登录状态更新超时');
            }
          }, 10000);
        } else {
          reject('登录失败，请重试');
        }
      })
      .catch((error) => {
        reject(error.message || '登录失败');
      });
    });
  };

  const GoogleLoginButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center space-x-3 w-full px-4 py-3 
        border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      ) : (
        <Image
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width={20}
          height={20}
        />
      )}
      <span className="text-sm font-medium">
        {isLoading ? '登录中...' : '使用 Google 登录'}
      </span>
    </button>
  );

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      onLogout?.();
    } catch (error) {
      console.error('登出失败:', error);
      onError?.('登出失败，请重试');
    }
  };

  // 已登录用户信息显示
  const LoggedInUserInfo = () => (
    <div className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-green-50 border-green-200">
      <div className="flex items-center space-x-3">
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium text-green-800">
            {session?.user?.name || session?.user?.email}
          </p>
          <p className="text-xs text-green-600">已通过 Google 登录</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-green-700 hover:text-green-900 underline"
      >
        退出登录
      </button>
    </div>
  );

  // 如果已经登录且需要显示用户信息
  if (status === 'authenticated' && showUserInfo) {
    return <LoggedInUserInfo />;
  }

  // 如果已经登录但不需要显示用户信息
  if (status === 'authenticated' && !showUserInfo) {
    return null;
  }

  return (
    <>
      <GoogleLoginButton 
        onClick={handleGoogleLogin} 
        disabled={isLoading || status === 'loading'} 
      />
      
      {/* 简单的弹窗模态框 */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">正在登录</h3>
              <p className="text-gray-600">请在弹窗中完成 Google 登录</p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setIsLoading(false);
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}