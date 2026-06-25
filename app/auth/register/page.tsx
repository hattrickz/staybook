'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/auth'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['customer', 'manager']),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const defaultRole = searchParams.get('role') === 'manager' ? 'manager' : 'customer'

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user { id name email role }
              }
            }
          `,
          variables: { input: values },
        }),
      })

      const { data, errors } = await res.json()

      if (errors?.length) {
        toast.error(errors[0].message || 'Registration failed')
        return
      }

      login(data.register.user, data.register.token)
      toast.success('Account created! Welcome to StayBook 🎉')

      if (data.register.user.role === 'manager') {
        router.push('/dashboard/manager')
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
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-ink-primary mb-8">
          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
          StayBook
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-ink-primary mb-1">Create an account</h1>
          <p className="text-ink-secondary text-sm mb-6">Join millions of travelers using StayBook</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-surface-secondary rounded-xl">
            {(['customer', 'manager'] as const).map((r) => (
              <label
                key={r}
                className={`cursor-pointer rounded-lg py-2.5 px-3 text-center text-sm font-medium transition-all ${selectedRole === r
                  ? 'bg-white shadow-card text-brand'
                  : 'text-ink-secondary hover:text-ink-primary'
                  }`}
              >
                <input {...register('role')} type="radio" value={r} className="sr-only" />
                {r === 'customer' ? '🧳 Traveler' : '🏨 Hotel Manager'}
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="John Smith"
                className="input"
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

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
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="input pr-10"
                  autoComplete="new-password"
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
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-tertiary mt-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-brand hover:underline">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-ink-secondary mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}