import { useState, useEffect } from 'react'
import { Search, Star, Loader, Pencil, Trash2, MessageSquare, AlertTriangle } from 'lucide-react'
import reviewService, { ReviewResponse } from '@/services/reviewService'
import ReviewFormModal from '@/components/customer/ReviewFormModal'
import CustomerLayout from '@/components/layout/CustomerLayout'

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editing, setEditing] = useState<ReviewResponse | null>(null)
  const [deleting, setDeleting] = useState<ReviewResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({})
  const [stats, setStats] = useState({ total: 0, average: 0 })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const mine = await reviewService.getMyReviews()
      setReviews(mine)
      const avg = mine.length ? mine.reduce((sum, r) => sum + r.rating, 0) / mine.length : 0
      setStats({ total: mine.length, average: Number(avg.toFixed(1)) })
    } catch (err: any) {
      console.error('❌ Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = reviews.filter(
    (r) =>
      r.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdate = async (rating: number, comment: string) => {
    if (!editing) return
    await reviewService.updateReview(editing.id, { rating, comment })
    setEditing(null)
    await loadReviews()
  }

  const handleDelete = async (id: number) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }))
      await reviewService.deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setDeleting(null)
      await loadReviews()
    } catch (err: any) {
      console.error('❌ Failed to delete review:', err)
      alert('Failed to delete review')
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-8 animate-spin text-[#276247]" />
      </div>
    )
  }

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">MY ACCOUNT</p>
        <h2 className="text-3xl font-serif text-[#183b30] mt-1">My Reviews</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage the reviews you have written for hotels.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total reviews</p>
              <p className="mt-2 text-3xl font-semibold text-[#183b30]">{stats.total}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
              <MessageSquare className="size-5" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average rating you give</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.average}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100">
              <Star className="size-5 text-amber-600" />
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-semibold text-[#183b30]">Your reviews</h3>
            <p className="mt-1 text-xs text-muted-foreground">Edit or delete any review you have posted</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247] w-64"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filtered.map((review) => (
              <div key={review.id} className="border rounded-xl p-4 hover:shadow-md transition flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[#183b30] text-lg">{review.hotelName}</h4>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-[#355047]">{review.rating}/5</span>
                </div>

                <p className="text-sm text-[#355047] flex-1">{review.comment}</p>

                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setEditing(review)}
                    className="flex-1 py-2 px-3 text-sm font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg transition inline-flex items-center justify-center gap-2"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleting(review)}
                    disabled={actionLoading[review.id]}
                    className="flex-1 py-2 px-3 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-50 rounded-lg transition inline-flex items-center justify-center gap-2"
                  >
                    {actionLoading[review.id] ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-[#183b30]">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once an event is completed, review it from My Reservations
            </p>
          </div>
        )}
      </div>

      {editing && (
        <ReviewFormModal
          title="Edit review"
          hotelName={editing.hotelName}
          initialRating={editing.rating}
          initialComment={editing.comment}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center size-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#183b30] text-center">Delete review?</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              This action cannot be undone. Your review for <strong>{deleting.hotelName}</strong> will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleting(null)}
                disabled={actionLoading[deleting.id]}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting.id)}
                disabled={actionLoading[deleting.id]}
                className="flex-1 py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition inline-flex items-center justify-center gap-2"
              >
                {actionLoading[deleting.id] ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </CustomerLayout>
  )
}