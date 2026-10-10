import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { authService, LoginRequest } from '@/services'

const hero = '/eventstay-hero.png'

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold ${dark ? 'text-white' : 'text-[#19352c]'}`}>
      <span className={`grid size-9 place-items-center rounded-xl ${dark ? 'bg-white/15 text-[#d8b87a]' : 'bg-[#e8f0eb] text-[#276247]'}`}>
        <Building2 className="size-5" />
      </span>
      <span className="text-[19px]">
        Event<span className="text-[#b48643]">Stay</span>
      </span>
    </Link>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData)
      
      // Redirect based on role
      switch (response.role) {
        case 'CUSTOMER':
          navigate('/')
          break
        case 'HOTEL_MANAGER':
          navigate('/manager/dashboard')
          break
        case 'ADMIN':
          navigate('/admin/dashboard')
          break
        default:
          navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-[#193e31] lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden p-10">
          <img src={hero} alt="Venue" className="absolute inset-0 size-full object-cover opacity-30" />
          <div className="relative">
            <Logo dark />
          </div>
          <div className="relative max-w-md text-white">
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#d8b87a]">Welcome back</p>
            <h1 className="mt-4 font-serif text-5xl">The best moments begin with a place.</h1>
            <p className="mt-5 text-white/70">Sign in to continue planning, managing, or growing beautiful events.</p>
          </div>
          <p className="relative text-xs text-white/50">Celebrate. Stay. Remember.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#fbfaf7] px-5 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-12 font-serif text-4xl text-[#183b30] lg:mt-0">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your EventStay account.</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
            <label className="text-sm font-medium text-[#355047]">
              Email address
              <input 
                required 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>
            <label className="text-sm font-medium text-[#355047]">
              Password
              <input 
                required 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex gap-2 text-muted-foreground">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-[#276247]">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#276247] py-3.5 font-semibold text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to EventStay?{' '}
            <Link to="/register" className="font-semibold text-[#276247]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
