import { useState, useEffect } from 'react'
import { X, Loader, Star } from 'lucide-react'

interface ReviewFormModalProps {
  title: string
  hotelName?: string
  initialRating?: number
  initialComment?: string
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
}

export default function ReviewFormModal({
  title,
  hotelName,
  initialRating = 0,
  initialComment = '',
  onClose,
  onSubmit,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initialComment)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onSubmit(rating, comment.trim())
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-serif text-[#183b30]">{title}</h2>
            {hotelName && <p className="text-sm text-muted-foreground mt-1">{hotelName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground uppercase font-medium mb-3 block">
              Your rating
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="transition"
                >
                  <Star
                    className={`size-10 ${
                      n <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-[#183b30] font-medium mt-2">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase font-medium mb-2 block">
              Your comment
            </label>
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this hotel..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {comment.length} characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#276247] text-white font-semibold rounded-lg hover:bg-[#1a4a36] disabled:bg-gray-300 transition inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader className="size-4 animate-spin" />}
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
