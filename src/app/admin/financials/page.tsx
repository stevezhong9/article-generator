'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FinancialStats {
  totalRevenue: number;
  periodRevenue: number;
  totalOrders: number;
  periodOrders: number;
  averageOrderValue: number;
  recentPayments: {
    id: string;
    amount: number;
    amount_usd?: string;
    status: string;
    user_name: string;
    created_at: string;
    stripe_payment_intent_id?: string;
    orders?: {
      user_profiles?: {
        name?: string;
        email?: string;
        username?: string;
      };
      subscription_plans?: {
        name?: string;
      };
    };
  }[];
  revenueChart: { date: string; revenue: number; orders: number }[];
  topPlans: { planName: string; revenue: number; orders: number }[];
}

export default function AdminFinancialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    periodRevenue: 0,
    totalOrders: 0,
    periodOrders: 0,
    averageOrderValue: 0,
    recentPayments: [],
    revenueChart: [],
    topPlans: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // 权限检查由服务端API处理

    loadFinancialStats();
  }, [session, status, router, period]);

  const loadFinancialStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/financials?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('获取财务数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
                ← 返回概览
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">财务管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="year">本年</option>
              </select>
              <img
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {/* 核心指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">总收入</div>
                    <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">
                      {period === 'week' ? '本周收入' : period === 'month' ? '本月收入' : '本年收入'}
                    </div>
                    <div className="text-2xl font-bold text-blue-600">${stats.periodRevenue.toFixed(2)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">总订单数</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.totalOrders.toLocaleString()}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">平均订单价值</div>
                    <div className="text-2xl font-bold text-orange-600">${stats.averageOrderValue.toFixed(2)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 收入趋势图表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">收入趋势</h3>
                <div className="space-y-4">
                  {stats.revenueChart.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{
                              width: `${Math.max((item.revenue / Math.max(...stats.revenueChart.map(d => d.revenue))) * 100, 2)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门套餐</h3>
                <div className="space-y-4">
                  {stats.topPlans.slice(0, 5).map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                        <div className="text-xs text-gray-500">{plan.orders} 个订单</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">${plan.revenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          ${(plan.revenue / plan.orders).toFixed(2)}/订单
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最近支付记录 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">最近支付记录</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支付信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        套餐
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.stripe_payment_intent_id?.substring(0, 20)}...
                            </div>
                            <div className="text-xs text-green-600">
                              {payment.status === 'succeeded' ? '支付成功' : payment.status}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.orders?.user_profiles?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.orders?.user_profiles?.email}
                            </div>
                            {payment.orders?.user_profiles?.username && (
                              <div className="text-sm text-blue-600">
                                @{payment.orders.user_profiles.username}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.orders?.subscription_plans?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            ${parseFloat(payment.amount_usd || '0').toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.stripe_payment_intent_id && (
                            <a
                              href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Stripe详情
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}