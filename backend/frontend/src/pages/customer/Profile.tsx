import { useState, useEffect } from 'react'
import { Loader, Check, X, Mail, Phone, MapPin, User } from 'lucide-react'
import userService, { UserResponse } from '@/services/userService'
import CustomerLayout from '@/components/layout/CustomerLayout'

export default function Profile() {
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userService.getCurrentUserProfile()
      setProfile(data)
      setForm({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
      })
    } catch (err: any) {
      console.error('❌ Failed to load profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await userService.updateUser(profile.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        address: form.address.trim() || undefined,
      })
      await loadProfile()
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      })
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader className="size-8 animate-spin text-[#276247]" />
        </div>
      </CustomerLayout>
    )
  }

  if (!profile) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">MY ACCOUNT</p>
          <h2 className="text-3xl font-serif text-[#183b30] mt-1">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account details and personal information.</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <X className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-[#276247] to-[#183b30]">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User className="size-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">{profile.name}</h3>
                <p className="text-white text-opacity-90">{profile.role}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!editing ? (
              <>
                {/* Display Mode */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Full Name</label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <User className="size-5 text-[#276247]" />
                        <p className="text-lg font-medium text-[#183b30]">{profile.name}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Email</label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <Mail className="size-5 text-[#276247]" />
                        <p className="text-lg font-medium text-[#183b30]">{profile.email}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Phone Number</label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <Phone className="size-5 text-[#276247]" />
                        <p className="text-lg font-medium text-[#183b30]">{profile.phoneNumber || '-'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Address</label>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <MapPin className="size-5 text-[#276247]" />
                        <p className="text-lg font-medium text-[#183b30]">{profile.address || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="bg-[#e8f0eb] rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <p className="font-medium text-[#183b30]">{profile.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>

                    <div className="bg-[#e8f0eb] rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Email Verification</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${profile.emailVerified ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        <p className="font-medium text-[#183b30]">{profile.emailVerified ? 'Verified' : 'Not verified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full mt-6 py-3 px-4 bg-[#276247] text-white font-semibold rounded-lg hover:bg-[#1a4a36] transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Address</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-[#276247] text-white font-semibold rounded-lg hover:bg-[#1a4a36] disabled:bg-gray-300 transition inline-flex items-center justify-center gap-2"
                    >
                      {saving && <Loader className="size-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Created Info */}
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Account Information</p>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Member Since</p>
              <p className="font-medium text-[#183b30]">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {profile.updatedAt && (
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium text-[#183b30]">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
