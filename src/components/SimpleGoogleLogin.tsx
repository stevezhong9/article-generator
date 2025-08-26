'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

interface SimpleGoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  callbackUrl?: string;
  showUserInfo?: boolean;
  buttonText?: string;
  className?: string;
}

export default function SimpleGoogleLogin({ 
  onSuccess, 
  onError, 
  callbackUrl = '/',
  showUserInfo = true,
  buttonText = '使用 Google 登录',
  className = ''
}: SimpleGoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false 
      });

      if (result?.ok) {
        onSuccess?.();
      } else {
        onError?.(result?.error || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      onError?.(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Logout error:', error);
      onError?.('登出失败，请重试');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">检查登录状态...</span>
        </div>
      </div>
    );
  }

  // Already logged in
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

  // If already authenticated but not showing user info
  if (status === 'authenticated' && !showUserInfo) {
    return null;
  }

  // Login button
  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`
        flex items-center justify-center space-x-3 w-full px-4 py-3 
        border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 transition-colors
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">登录中...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">{buttonText}</span>
        </>
      )}
    </button>
  );
}