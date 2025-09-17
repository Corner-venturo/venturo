'use client'

import { Button } from '@/components/catalyst/button'
import { Checkbox, CheckboxField } from '@/components/catalyst/checkbox'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Heading } from '@/components/catalyst/heading'
import { Input } from '@/components/catalyst/input'
import { Strong, Text, TextLink } from '@/components/catalyst/text'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      // 登入成功，導向主頁
      router.push('/todos')
    }
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

          <Heading>登入您的帳號</Heading>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Field>
            <Label>電子郵件</Label>
            <Input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="輸入您的密碼"
              disabled={loading}
            />
          </Field>

          <div className="flex items-center justify-between">
            <CheckboxField>
              <Checkbox 
                name="remember" 
                checked={rememberMe}
                onChange={setRememberMe}
                disabled={loading}
              />
              <Label>記住我</Label>
            </CheckboxField>
            <Text>
              <TextLink href="/forgot-password">
                <Strong>忘記密碼？</Strong>
              </TextLink>
            </Text>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </Button>

          <Text className="text-center">
            還沒有帳號？{' '}
            <TextLink href="/register">
              <Strong>立即註冊</Strong>
            </TextLink>
          </Text>
        </form>
      </div>
    </div>
  )
}
