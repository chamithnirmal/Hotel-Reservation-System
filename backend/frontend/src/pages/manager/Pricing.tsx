import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Percent, Edit2, Tag } from 'lucide-react'
import { eventPackageService, EventPackageResponse, venueService, hotelService } from '@/services'
import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface PricingFormData {
  packageId: number;
  guestCount: number;
  totalPrice: number;
}

interface EditingPrice {
  packageId: number;
  priceId: number;  // Changed from priceIndex to priceId (the actual database ID)
  guestCount: number;
  totalPrice: number;
}

export default function Pricing() {
  const [packages, setPackages] = useState<EventPackageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingPrice, setEditingPrice] = useState<EditingPrice | null>(null)

  const [formData, setFormData] = useState<PricingFormData>({
    packageId: 0,
    guestCount: 0,
    totalPrice: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessModal])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading packages for manager pricing...')

      let managerHotel
      try {
        managerHotel = await hotelService.getManagerHotel()
        console.log('Manager hotel:', managerHotel)
      } catch (err: any) {
        console.error('Failed to get manager hotel:', err)
        setError('Failed to load your hotel information')
        setLoading(false)
        return
      }

      let venuesData
      try {
        venuesData = await venueService.getVenuesByHotel(managerHotel.id)
        console.log('Venues for hotel:', venuesData.length, 'items')
      } catch (err: any) {
        console.error('Failed to load venues:', err)
        setError('Failed to load venues')
        setLoading(false)
        return
      }

      let packagesData: EventPackageResponse[] = []
      try {
        const allPackages: EventPackageResponse[] = []
        for (const venue of venuesData) {
          const venuePackages = await eventPackageService.getPackagesByVenue(venue.id)
          allPackages.push(...venuePackages)
        }
        packagesData = allPackages
        console.log('Packages loaded:', packagesData.length)
        setPackages(packagesData)
        setError('')
      } catch (err: any) {
        console.error('Failed to load packages:', err)
        setError(err.response?.data?.message || 'Failed to load packages')
      }
    } catch (err: any) {
      console.error('Unexpected error in loadData:', err)
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.packageId) {
      setError('Please select a package')
      return
    }

    if (formData.guestCount <= 0) {
      setError('Guest count must be greater than 0')
      return
    }

    if (formData.totalPrice <= 0) {
      setError('Total price must be greater than 0')
      return
    }

    try {
      if (editingPrice) {
        // Update existing pricing
        console.log('Updating pricing for price ID:', editingPrice.priceId)
        await eventPackageService.updatePackagePrice(
          editingPrice.packageId,
          editingPrice.priceId,  // Use the actual price ID
          formData.guestCount,
          formData.totalPrice
        )
        console.log('Pricing updated successfully')
        setSuccessMessage(`Pricing updated: ${formData.guestCount} guests @ LKR ${formData.totalPrice.toLocaleString()}`)
      } else {
        console.log('Creating pricing rule...', formData)
        
        await eventPackageService.addPackagePrice(
          formData.packageId,
          {
            minGuests: formData.guestCount,
            maxGuests: formData.guestCount,
            pricePerPerson: formData.totalPrice
          }
        )
        
        console.log('Pricing rule created successfully')
        
        const selectedPackage = packages.find(p => p.id === formData.packageId)
        setSuccessMessage(`Pricing added for ${selectedPackage?.packageName || 'package'}: ${formData.guestCount} guests @ LKR ${formData.totalPrice.toLocaleString()}`)
      }
      
      setShowModal(false)
      setShowSuccessModal(true)
      setEditingPrice(null)
      
      // Reload data
      await loadData()
      
      // Reset form
      setFormData({
        packageId: 0,
        guestCount: 0,
        totalPrice: 0
      })
    } catch (err: any) {
      console.error('Failed to save pricing rule:', err)
      setError(err.response?.data?.message || 'Failed to save pricing rule')
    }
  }

  const handleEditPrice = (pkg: EventPackageResponse, priceIdx: number, price: any) => {
    console.log('Editing price:', price)
    setEditingPrice({
      packageId: pkg.id,
      priceId: price.id,  // Use the actual database ID from the price object
      guestCount: price.guestCount,
      totalPrice: price.totalPrice
    })
    setFormData({
      packageId: pkg.id,
      guestCount: price.guestCount,
      totalPrice: Number(price.totalPrice)
    })
    setShowModal(true)
  }

  const activePricingRules = packages.reduce((acc, pkg) => acc + (pkg.pricing?.length || 0), 0)
  const avgBookingValue = packages.reduce((acc, pkg) => acc + (pkg.basePrice || 0), 0) / packages.length || 0
  const peakSeasonUplift = '+18%'

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Revenue Management</p>
                  <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
                </div>
              </div>
              <p className="text-gray-600 ml-[52px]">Configure pricing rules for packages and guest counts</p>
            </div>
            <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Pricing Rule
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Active Pricing Rules</p>
            <p className="text-3xl font-bold">{activePricingRules}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Avg. Booking Value</p>
            <p className="text-3xl font-bold">LKR {avgBookingValue.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Percent className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-amber-100 text-sm mb-1">Peak Season Uplift</p>
            <p className="text-3xl font-bold">{peakSeasonUplift}</p>
          </div>
        </div>

        {/* Pricing Rules Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pricing Rules</h3>
            <p className="text-sm text-gray-600">Manage pricing for different packages and guest counts</p>
          </div>

          {packages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pricing rules configured</h3>
              <p className="text-gray-600 mb-6">Create your first pricing rule to manage package costs</p>
              <Button onClick={() => setShowModal(true)} variant="primary" className="mx-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing Rule
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Guest Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {packages.map((pkg) => (
                    pkg.pricing && pkg.pricing.length > 0 ? (
                      pkg.pricing.map((price, idx) => (
                        <tr key={`${pkg.id}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{pkg.eventType}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-700">{pkg.venueName || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                              <span className="text-sm font-medium text-gray-900">{price.guestCount}</span>
                              <span className="text-xs text-gray-500">guests</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-emerald-600">LKR {price.totalPrice.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="success">Active</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              type="button"
                              onClick={() => handleEditPrice(pkg, idx, price)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Tag className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{pkg.eventType}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{pkg.venueName || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-400">No pricing</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-400">-</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default">Pending</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, packageId: pkg.id })
                              setShowModal(true)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Pricing Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingPrice ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
                </h3>
              </div>
              <p className="text-sm text-gray-600 ml-[52px]">Set the price for a specific guest count</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package *</label>
                <select
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: parseInt(e.target.value) })}
                  disabled={editingPrice !== null}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.packageName} ({pkg.eventType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Count *</label>
                  <input
                    type="number"
                    value={formData.guestCount || ''}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 100"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Number of guests for this pricing tier</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Price (LKR) *</label>
                  <input
                    type="number"
                    value={formData.totalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 350000"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Complete package price</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingPrice ? 'Update Pricing' : 'Add Pricing'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingPrice(null)
                    setFormData({ packageId: 0, guestCount: 0, totalPrice: 0 })
                    setError('')
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {successMessage}
              </p>
              <div className="text-xs text-gray-500 mb-4">Closing automatically in 3 seconds...</div>
              <Button onClick={() => setShowSuccessModal(false)} variant="primary" className="w-full">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceSlowly {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-in; }
        .animate-scale-up { animation: scaleUp 0.4s ease-out; }
        .animate-bounce-slow { animation: bounceSlowly 2s infinite; }
      `}</style>
    </ManagerLayout>
  )
}
