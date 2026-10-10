import { Link } from 'react-router-dom'
import { AlertCircle, Building2, ArrowRight } from 'lucide-react'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-[#19352c]">
      <span className="grid size-9 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
        <Building2 className="size-5" />
      </span>
      <span className="text-[19px]">
        Event<span className="text-[#b48643]">Stay</span>
      </span>
    </Link>
  )
}

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fbfaf7] p-6 text-center">
      <div>
        <Logo />
        <div className="mx-auto mt-10 grid size-20 place-items-center rounded-3xl bg-[#e8f0eb] text-[#276247]">
          <AlertCircle className="size-9" />
        </div>
        <h1 className="mt-6 font-serif text-4xl text-[#183b30]">This page is coming together.</h1>
        <p className="mt-3 text-muted-foreground">Explore the landing page, discovery, login, and role-based demo workspaces.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[#276247] px-5 py-3 text-sm font-semibold text-white"
        >
          Back to EventStay <ArrowRight className="ml-2 inline size-4" />
        </Link>
      </div>
    </div>
  )
}
