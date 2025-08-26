'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  callbackUrl?: string;
}

export default function GoogleLoginModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError,
  callbackUrl = '/'
}: GoogleLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session && isLoading) {
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }
  }, [status, session, isLoading, onSuccess, onClose]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl 
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (!result?.ok) {
        throw new Error('登录失败，请重试');
      }

      // 等待 session 更新
      const maxAttempts = 20; // 10秒最多重试20次
      let attempts = 0;
      
      const checkSession = () => {
        attempts++;
        if (status === 'authenticated') {
          setIsLoading(false);
          onSuccess?.();
          onClose();
        } else if (attempts < maxAttempts) {
          setTimeout(checkSession, 500);
        } else {
          setIsLoading(false);
          onError?.('登录状态更新超时，请刷新页面重试');
        }
      };

      setTimeout(checkSession, 500);

    } catch (error) {
      console.error('登录失败:', error);
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : '登录失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">登录到 ShareX AI</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 登录按钮 */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`
              flex items-center justify-center space-x-3 w-full px-4 py-3 
              border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
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
        </div>

        {/* 说明文本 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            登录即表示您同意我们的{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
              服务条款
            </a>{' '}
            和{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// 带状态的登录按钮和用户信息显示组件
interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onLogout?: () => void;
  callbackUrl?: string;
  showUserInfo?: boolean;
  buttonText?: string;
  className?: string;
}

export function GoogleAuthButton({ 
  onSuccess, 
  onError, 
  onLogout,
  callbackUrl = '/',
  showUserInfo = true,
  buttonText = '登录',
  className = ''
}: GoogleAuthButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      onLogout?.();
    } catch (error) {
      console.error('登出失败:', error);
      onError?.('登出失败，请重试');
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    setShowModal(false);
  };

  const handleError = (error: string) => {
    onError?.(error);
    setShowModal(false);
  };

  // 已登录用户信息显示
  if (status === 'authenticated' && showUserInfo) {
    return (
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
  }

  // 如果已登录但不显示用户信息
  if (status === 'authenticated' && !showUserInfo) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          inline-flex items-center px-4 py-2 border border-transparent 
          text-sm font-medium rounded-md text-white bg-blue-600 
          hover:bg-blue-700 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-blue-500 transition-colors
          ${className}
        `}
      >
        {buttonText}
      </button>

      <GoogleLoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        onError={handleError}
        callbackUrl={callbackUrl}
      />
    </>
  );
}