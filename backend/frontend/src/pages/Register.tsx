import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { authService, RegisterRequest } from '@/services'

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

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    role: 'CUSTOMER'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    console.log('Registration data:', formData)

    try {
      const response = await authService.register(formData)
      console.log('Registration successful:', response)
      
      // Redirect based on role with a small delay to ensure proper navigation
      setTimeout(() => {
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
      }, 500)
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response)
      
      // Extract error message
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please check your details and try again.'
      setError(errorMessage)
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
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#d8b87a]">Join EventStay</p>
            <h1 className="mt-4 font-serif text-5xl">Start your journey with us.</h1>
            <p className="mt-5 text-white/70">Create an account to book stunning venues or manage your hotel properties.</p>
          </div>
          <p className="relative text-xs text-white/50">Celebrate. Stay. Remember.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#fbfaf7] px-5 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-12 font-serif text-4xl text-[#183b30] lg:mt-0">Create account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join EventStay to get started.</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-5">
            <label className="text-sm font-medium text-[#355047]">
              Full name
              <input 
                required 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>

            <label className="text-sm font-medium text-[#355047]">
              Email address
              <input 
                required 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>

            <label className="text-sm font-medium text-[#355047]">
              Phone number
              <input 
                required 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+94712345678"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>

            <label className="text-sm font-medium text-[#355047]">
              Address
              <textarea 
                required 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Colombo"
                rows={2}
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
                minLength={6}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
              <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters</p>
            </label>

            <label className="text-sm font-medium text-[#355047]">
              Confirm password
              <input 
                required 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]" 
              />
            </label>

            <label className="text-sm font-medium text-[#355047]">
              I want to register as
              <select 
                required 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#9ac3aa]"
              >
                <option value="CUSTOMER">Customer - Book venues for events</option>
                <option value="HOTEL_MANAGER">Hotel Manager - Manage properties</option>
                <option value="ADMIN">Admin - System administrator</option>
              </select>
            </label>

            <button 
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#276247] py-3.5 font-semibold text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#276247]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
