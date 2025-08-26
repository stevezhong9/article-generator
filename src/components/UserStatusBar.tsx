'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserStatus {
  subscription: {
    planName: string;
    isActive: boolean;
    expiresAt?: string;
  } | null;
  isVip: boolean;
  canCreate: boolean;
  dailyUsage: number;
  dailyLimit: number | null;
}

export default function UserStatusBar() {
  const { data: session } = useSession();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserStatus();
    }
  }, [session]);

  const loadUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/status');
      const result = await response.json();
      
      if (result.success) {
        setUserStatus(result.data);
      }
    } catch (error) {
      console.error('获取用户状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新用户状态（在文章创建后调用）
  const refreshStatus = () => {
    if (session?.user?.id) {
      loadUserStatus();
    }
  };

  if (!session || loading) {
    return null;
  }

  if (!userStatus) {
    return null;
  }

  return (
    <div className="card-brand p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 用户头像和信息 */}
          <img
            src={session.user.image || ''}
            alt={session.user.name || ''}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-neutral-900">{session.user.name}</p>
            <p className="text-sm text-neutral-600">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* 会员状态 */}
          {userStatus.isVip ? (
            <div className="flex items-center">
              <span className="badge-vip px-4 py-2 text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                VIP会员 - 无限制 ✨
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="badge-free px-4 py-2 text-sm">
                免费版用户
              </span>
              <div className="ml-3 text-sm text-neutral-600">
                今日已用: <span className="font-medium">{userStatus.dailyUsage}</span>/{userStatus.dailyLimit} 篇
              </div>
            </div>
          )}

          {/* 升级按钮 */}
          {!userStatus.isVip && (
            <Link
              href="/subscription/pricing"
              className="btn-brand-primary text-sm transform hover:scale-105 shadow-brand-blue"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="flex items-center space-x-1">
                <span>升级VIP</span>
                <span className="text-xs">✨</span>
              </span>
            </Link>
          )}

          {/* 个人资料链接 */}
          <Link
            href="/profile"
            className="nav-brand-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            个人资料
          </Link>
        </div>
      </div>

      {/* 进度条（免费用户） */}
      {!userStatus.isVip && userStatus.dailyLimit && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-600 mb-2">
            <span className="font-medium">今日使用进度</span>
            <span className="font-semibold">{userStatus.dailyUsage}/{userStatus.dailyLimit}</span>
          </div>
          <div className="progress-brand">
            <div 
              className="progress-brand-bar"
              style={{ 
                width: `${Math.min((userStatus.dailyUsage / userStatus.dailyLimit) * 100, 100)}%` 
              }}
            ></div>
          </div>
          {userStatus.dailyUsage >= userStatus.dailyLimit && (
            <div className="flex items-center space-x-2 mt-3 p-3 bg-error-bg border border-red-200 rounded-lg">
              <svg className="w-4 h-4 text-error flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-error font-medium">
                今日免费额度已用完，
                <Link href="/subscription/pricing" className="text-brand-orange hover:text-brand-orange-dark font-semibold underline ml-1">
                  升级VIP解锁无限制 ✨
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 导出刷新函数，供外部组件调用
export { UserStatusBar };