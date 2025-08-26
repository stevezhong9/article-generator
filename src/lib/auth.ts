import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // 添加用户信息到session
        session.user.id = user.id
        // 获取用户的自定义用户名和角色
        if (supabase) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username, role')
            .eq('user_id', user.id)
            .single()
          
          session.user.username = profile?.username || null
          session.user.role = profile?.role || 'user'
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.id) {
        // 检查是否已存在用户配置
        if (supabase) {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (!existingProfile) {
            // 创建用户配置记录
            await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.image,
                username: null // 待用户设置
              })
          }
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // 如果是弹窗登录，重定向到弹窗处理页面
      if (url.includes('popup=true')) {
        return `${baseUrl}/auth/popup?${new URL(url).searchParams}`;
      }
      
      // 如果url是相对路径，使用baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // 如果url是同源的，直接返回
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        // URL格式错误时返回baseUrl
      }
      
      // 否则返回baseUrl
      return baseUrl;
    }
  },
  // 移除自定义页面配置，使用 NextAuth 默认页面
  session: {
    strategy: 'database'
  }
}