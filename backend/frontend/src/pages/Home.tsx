import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Building2, CalendarCheck, CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign, Eye, Heart, Hotel, LayoutDashboard, MapPin, Menu, Plus, Search, ShieldCheck, Sparkles, Star, Users, BarChart3, SlidersHorizontal, Filter, MoreHorizontal, PartyPopper, MessageSquare, Award, Clock3, Download, AlertCircle, Settings } from 'lucide-react'
import { mockReviews } from '@/lib/mock-data'
import { hotelService, HotelResponse, authService } from '@/services'
import type { UserRole } from '@/lib/types'

const hero = '/eventstay-hero.png'
const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

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

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: string }) {
  const c = tone === 'gold' ? 'bg-[#fbf0d9] text-[#87611f]' : tone === 'blue' ? 'bg-[#e7eef8] text-[#315d91]' : tone === 'red' ? 'bg-[#f9e8e5] text-[#9e4037]' : 'bg-[#e7f3ec] text-[#276247]'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${c}`}>{children}</span>
}

function Rating({ v, n }: { v: number; n?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-4 fill-[#d8a84e] text-[#d8a84e]" />
      <b>{v}</b>
      {n && <span className="text-muted-foreground">({n})</span>}
    </span>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const isCustomerLoggedIn = user?.role === 'CUSTOMER'
  const isManagerLoggedIn = user?.role === 'HOTEL_MANAGER'
  const isAdminLoggedIn = user?.role === 'ADMIN'
  const isLoggedIn = isCustomerLoggedIn || isManagerLoggedIn || isAdminLoggedIn

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
      setOpen(false)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="absolute inset-x-0 top-0 z-10 border-b border-white/15 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Logo dark />
        <nav className="hidden gap-7 text-sm text-white/80 md:flex">
          <Link to="/hotels">Find a venue</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/about">About us</Link>
          <Link to="/faq">Help</Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-white/70">
                {user?.name} <span className="text-xs text-white/50">({user?.role})</span>
              </span>
              {isCustomerLoggedIn && (
                <button 
                  onClick={() => navigate('/customer/dashboard')}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#19352c] hover:bg-white/90 transition-colors"
                >
                  Dashboard
                </button>
              )}
              {isManagerLoggedIn && (
                <button 
                  onClick={() => navigate('/manager/hotel')}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#19352c] hover:bg-white/90 transition-colors"
                >
                  My Hotel
                </button>
              )}
              {isAdminLoggedIn && (
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#19352c] hover:bg-white/90 transition-colors"
                >
                  Admin
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#19352c]">
                List your venue
              </Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-lg border border-white/25 p-2 md:hidden">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl bg-[#183b30] p-4 text-sm md:hidden">
          <Link to="/hotels">Find a venue</Link>
          <Link to="/compare">Compare</Link>
          {isLoggedIn ? (
            <>
              <div className="border-t border-white/20 pt-3 mt-3">
                <p className="text-white/70 text-xs mb-2">
                  {user?.name} <span className="text-white/50">({user?.role})</span>
                </p>
              </div>
              {isCustomerLoggedIn && (
                <button 
                  onClick={() => {
                    navigate('/customer/dashboard')
                    setOpen(false)
                  }}
                  className="text-left hover:text-white/80 transition-colors"
                >
                  Dashboard
                </button>
              )}
              {isManagerLoggedIn && (
                <button 
                  onClick={() => {
                    navigate('/manager/hotel')
                    setOpen(false)
                  }}
                  className="text-left hover:text-white/80 transition-colors"
                >
                  My Hotel
                </button>
              )}
              {isAdminLoggedIn && (
                <button 
                  onClick={() => {
                    navigate('/admin/dashboard')
                    setOpen(false)
                  }}
                  className="text-left hover:text-white/80 transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="text-left text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </div>
      )}
    </header>
  )
}

function SearchPanel() {
  return (
    <div className="rounded-2xl bg-white p-2 shadow-2xl md:flex">
      <div className="grid flex-1 grid-cols-2 md:grid-cols-4">
        <label className="px-4 py-3 text-xs text-muted-foreground">
          Where?
          <input className="mt-1 block w-full bg-transparent text-sm font-semibold outline-none" placeholder="City or hotel" />
        </label>
        <label className="px-4 py-3 text-xs text-muted-foreground">
          Event type
          <select className="mt-1 block w-full bg-transparent text-sm font-semibold outline-none">
            <option>Wedding</option>
            <option>Birthday</option>
            <option>Conference</option>
            <option>Corporate Meeting</option>
          </select>
        </label>
        <label className="px-4 py-3 text-xs text-muted-foreground">
          Event date
          <input type="date" className="mt-1 block w-full bg-transparent text-sm font-semibold outline-none" />
        </label>
        <label className="px-4 py-3 text-xs text-muted-foreground">
          Guests
          <input placeholder="50 guests" className="mt-1 block w-full bg-transparent text-sm font-semibold outline-none" />
        </label>
      </div>
      <Link to="/hotels" className="m-1 flex items-center justify-center gap-2 rounded-xl bg-[#276247] px-6 py-4 text-sm font-semibold text-white">
        <Search className="size-4" />
        Search venues
      </Link>
    </div>
  )
}

function HotelCard({ h }: { h: HotelResponse }) {
  const imgUrl = h.image 
    ? `data:image/jpeg;base64,${h.image}`
    : `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80`
  
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[1.7]">
        <img src={imgUrl} alt={h.name} className="size-full object-cover" />
        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#276247]" aria-label="Save venue">
          <Heart className="size-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#183b30]">{h.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {h.city}
            </p>
          </div>
          {h.starRating && <Rating v={h.starRating} />}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{h.description}</p>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">Verified venue</span>
          <Link to={`/hotels/${h.id}`} className="text-sm font-semibold text-[#276247]">
            Explore <ArrowRight className="ml-1 inline size-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const [hotels, setHotels] = useState<HotelResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      const data = await hotelService.getAllHotels()
      setHotels(data.slice(0, 4)) // Show only first 4 hotels
      console.log('✅ Hotels loaded:', data.length)
    } catch (err: any) {
      console.error('❌ Failed to load hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <section className="relative min-h-[690px] overflow-hidden bg-[#183b30]">
        <img src={hero} alt="Elegant special event" className="absolute inset-0 size-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12392e] via-[#12392e]/80 to-transparent" />
        <Header />
        <div className="relative mx-auto max-w-7xl px-5 pb-44 pt-44 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-[#f0d6a1]">
              Curated venues for life&apos;s best moments
            </span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-white md:text-7xl">
              Find the perfect venue for your <em className="text-[#d8b87a]">special event.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Discover exceptional hotels, beautiful event venues, and packages designed for weddings, birthdays, conferences, corporate events, and celebrations.
            </p>
          </div>
          <div className="mt-10 max-w-5xl">
            <SearchPanel />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 lg:px-8">
        <div className="grid gap-4 rounded-2xl border bg-white p-5 shadow-lg md:grid-cols-3">
          {[['Verified venues', ShieldCheck, 'Every venue is personally reviewed.'], ['Plan with confidence', Sparkles, 'Transparent packages and pricing.'], ['Here to help', MessageSquare, 'Real people, whenever you need us.']].map(([t, I, d]: any) => (
            <div className="flex gap-3" key={t}>
              <span className="grid size-11 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
                <I className="size-5" />
              </span>
              <div>
                <b className="text-[#19352c]">{t}</b>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#b48643]">Curated for you</span>
            <h2 className="mt-3 font-serif text-4xl text-[#183b30]">Places worth celebrating in</h2>
          </div>
          <Link to="/hotels" className="hidden text-sm font-semibold text-[#276247] md:block">
            View all venues <ArrowRight className="ml-1 inline size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276247]"></div>
            </div>
          ) : hotels.length > 0 ? (
            hotels.map((h) => (
              <HotelCard key={h.id} h={h} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No hotels available</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#eef4ef]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#b48643]">Effortless planning</span>
            <h2 className="mt-3 font-serif text-4xl text-[#183b30]">From first idea to final toast.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[['01', 'Discover', 'Browse beautiful venues and compare packages.'], ['02', 'Reserve', 'Send a reservation request in minutes.'], ['03', 'Celebrate', 'Enjoy a seamless experience with your venue team.'], ['04', 'Remember', 'Share your story with future guests.']].map(([n, t, d]) => (
              <div className="rounded-2xl bg-white p-6" key={n}>
                <span className="font-serif text-3xl text-[#d8b87a]">{n}</span>
                <h3 className="mt-4 font-semibold text-[#183b30]">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#b48643]">Guest notes</span>
          <h2 className="mt-3 font-serif text-4xl text-[#183b30]">Memories made with EventStay</h2>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {mockReviews.map((r) => (
            <div className="rounded-2xl border bg-white p-6" key={r.id}>
              <Rating v={r.rating} />
              <p className="mt-5 leading-7 text-[#355047]">&quot;{r.comment}&quot;</p>
              <p className="mt-5 text-sm font-semibold text-[#183b30]">Jayani Wijesinghe</p>
              <p className="text-xs text-muted-foreground">Verified guest</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">Celebrate. Stay. Remember.</p>
          </div>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Sign in</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 EventStay Sri Lanka</p>
        </div>
      </footer>
    </div>
  )
}
