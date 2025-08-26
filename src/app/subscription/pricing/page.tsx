'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { SubscriptionPlan } from '@/lib/supabase';

interface SubscriptionStatus {
  subscription: any;
  isVip: boolean;
  canCreate: boolean;
  dailyUsage: number;
  dailyLimit: number | null;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userStatus, setUserStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
    if (session?.user?.id) {
      loadUserStatus();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const result = await response.json();
      
      console.log('Plans API response:', result);
      
      if (result.success) {
        setPlans(result.data || []);
        console.log('Loaded plans:', result.data);
      } else {
        console.error('API returned error:', result.error);
      }
    } catch (error) {
      console.error('获取套餐失败:', error);
    }
  };

  const loadUserStatus = async () => {
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

  const handleSubscribe = async (planId: number) => {
    if (!session) {
      signIn('google');
      return;
    }

    setCheckoutLoading(planId);
    
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const result = await response.json();

      if (result.success) {
        // 重定向到Stripe结账页面
        window.location.href = result.data.url;
      } else {
        alert(result.error || '创建支付会话失败');
      }
    } catch (error) {
      console.error('创建支付会话失败:', error);
      alert('创建支付会话失败，请稍后重试');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const freePlan = plans.find(p => p.price_usd === 0);
  const paidPlans = plans.filter(p => p.price_usd > 0).sort((a, b) => a.price_usd - b.price_usd);

  // If no plans found, show a message
  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">套餐暂未配置</h2>
          <p className="text-gray-600 mb-6">系统正在初始化中，套餐信息暂不可用。</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-0">ShareX AI 订阅套餐</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            选择最适合您的AI超级分享平台套餐，解锁无限制的智能内容分享功能
          </p>
          
          {/* 用户状态显示 */}
          {userStatus && (
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-lg">
              {userStatus.isVip ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  您是VIP用户 - 无限制使用
                </span>
              ) : (
                <span>
                  今日已使用: {userStatus.dailyUsage}/{userStatus.dailyLimit} 篇文章
                </span>
              )}
            </div>
          )}
        </div>

        {/* 套餐对比 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* 免费版 */}
          {freePlan && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{freePlan.name}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-2">
                  免费
                </div>
                <p className="text-gray-600">{freePlan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  每天3篇文章
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  基础功能使用
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  个人用户名页面
                </li>
              </ul>
              
              <button
                disabled
                className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
              >
                当前方案
              </button>
            </div>
          )}
          
          {/* VIP套餐 */}
          {paidPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm border p-8 relative transition-all duration-300 ${
                plan.duration_months === 12 
                  ? 'border-orange-500 transform scale-105 shadow-lg relative' 
                  : 'border-gray-200 hover:shadow-lg'
              }`}
            >
              {plan.duration_months === 12 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  ${plan.price_usd}
                  <span className="text-lg text-gray-600 font-normal">
                    /{plan.duration_months === 1 ? '月' : '年'}
                  </span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
                {plan.duration_months === 12 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    节省 $18 (相当于月付$7.5)
                  </p>
                )}
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  无限制文章转发
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  优先客服支持
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  品牌营销推广
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  高级统计功能
                </li>
              </ul>
              
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={checkoutLoading === plan.id || userStatus?.isVip}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  userStatus?.isVip
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.duration_months === 12
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105 shadow-lg'
                } ${checkoutLoading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {checkoutLoading === plan.id ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    处理中...
                  </span>
                ) : userStatus?.isVip ? (
                  '已是VIP用户'
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>立即升级VIP</span>
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">常见问题</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  支付安全吗？
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">我们使用国际领先的Stripe支付系统，银行级加密保护您的支付信息。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  可以随时取消吗？
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">当然可以！您可以随时在个人设置中取消订阅，无任何违约金。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  年付有优惠吗？
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">年付方案可节省20%费用，相当于免费获得2个月的VIP服务。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  升级后立即生效吗？
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">支付完成后即时生效，立即解锁所有VIP功能和无限制使用权限。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}