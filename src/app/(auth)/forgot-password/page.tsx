'use client'

import { useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Field, Label } from '@/components/catalyst/fieldset'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage('發送重設信件時出錯：' + error.message)
    } else {
      setMessage('重設密碼連結已發送到您的信箱！')
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            輸入您的 Email，我們會發送重設密碼連結給您
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </Field>

          {message && (
            <div className={`rounded-md p-3 text-sm ${
              message.includes('出錯') 
                ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '發送中...' : '發送重設連結'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              返回登入
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
