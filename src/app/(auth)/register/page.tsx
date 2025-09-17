'use client'

import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Heading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Strong, Text, TextLink } from '@/components/catalyst/text'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不相符')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密碼至少需要 6 個字元')
      setLoading(false)
      return
    }

    // 使用 Supabase 註冊
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.name,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else if (data?.user) {
      // 建立 profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: formData.email,
          display_name: formData.name,
          role: 'PUBLIC'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // 註冊成功，導向登入頁
      router.push('/login?registered=true')
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="grid w-full grid-cols-1 gap-8">
          {/* Logo / Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              VenturoERP
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Work-Life Integration Platform
            </p>
          </div>

          <Heading>建立新帳號</Heading>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Field>
            <Label>姓名</Label>
            <Input 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              placeholder="您的姓名"
              disabled={loading}
            />
          </Field>

          <Field>
            <Label>電子郵件</Label>
            <Input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              placeholder="your@email.com"
              disabled={loading}
            />
          </Field>

          <Field>
            <Label>密碼</Label>
            <Input 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              placeholder="設定您的密碼（至少 6 個字元）"
              disabled={loading}
            />
          </Field>

          <Field>
            <Label>確認密碼</Label>
            <Input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              required
              placeholder="再次輸入密碼"
              disabled={loading}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '註冊中...' : '註冊'}
          </Button>

          <Text className="text-center">
            已經有帳號了？{' '}
            <TextLink href="/login">
              <Strong>立即登入</Strong>
            </TextLink>
          </Text>
        </form>
      </div>
    </div>
  )
}
