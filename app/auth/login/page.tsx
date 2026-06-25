'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/auth'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user { id name email role }
              }
            }
          `,
          variables: { email: values.email, password: values.password },
        }),
      })

      const { data, errors } = await res.json()

      if (errors?.length) {
        toast.error(errors[0].message || 'Invalid email or password')
        return
      }

      login(data.login.user, data.login.token)
      toast.success(`Welcome back, ${data.login.user.name.split(' ')[0]}!`)

      if (data.login.user.role === 'manager') {
        router.push('/dashboard/manager')
      } else if (data.login.user.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error('Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
          StayBook
        </Link>
        <div>
          <blockquote className="text-white/90 text-2xl font-medium leading-relaxed mb-4">
            "The best hotels in every corner of the world, one search away."
          </blockquote>
          <p className="text-brand-100 text-sm">— Trusted by 2 million travelers</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '12,500+', label: 'Hotels listed' },
            { value: '4.8★', label: 'Avg. rating' },
            { value: '180+', label: 'Countries' },
            { value: '24/7', label: 'Support' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-xl font-semibold text-white">{s.value}</div>
              <div className="text-brand-100 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-semibold text-lg text-ink-primary mb-8">
            <span className="w-2 h-2 rounded-full bg-brand inline-block" />
            StayBook
          </Link>

          <h1 className="text-2xl font-semibold text-ink-primary mb-1">Welcome back</h1>
          <p className="text-ink-secondary text-sm mb-8">Sign in to your account to continue</p>

          {/* Quick test accounts */}
          <div className="bg-surface-secondary rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-2">
              Quick test login
            </p>
            <button
              type="button"
              onClick={() => onSubmit({ email: 'customer@staybook.com', password: 'password123' })}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white transition-colors text-ink-secondary"
            >
              🧳 Customer — customer@staybook.com
            </button>
            <button
              type="button"
              onClick={() => onSubmit({ email: 'manager@staybook.com', password: 'password123' })}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white transition-colors text-ink-secondary"
            >
              🏨 Manager — manager@staybook.com
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-tertiary">or sign in manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="#" className="text-xs text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-secondary mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-brand font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}