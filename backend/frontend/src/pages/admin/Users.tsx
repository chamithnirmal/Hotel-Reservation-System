import { useState, useEffect } from 'react'
import { Search, Users as UsersIcon, Mail, Phone, MapPin, Calendar, Eye, Loader, User as UserIcon, Shield, X, Trash2, AlertCircle } from 'lucide-react'
import userService, { UserResponse } from '@/services/userService'

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    managers: 0,
    admins: 0,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)

      const customersCount = allUsers.filter(u => u.role === 'CUSTOMER').length
      const managersCount = allUsers.filter(u => u.role === 'HOTEL_MANAGER').length
      const adminsCount = allUsers.filter(u => u.role === 'ADMIN').length

      setStats({
        total: allUsers.length,
        customers: customersCount,
        managers: managersCount,
        admins: adminsCount,
      })

      console.log('✅ All users loaded:', allUsers.length)
    } catch (err: any) {
      console.error('❌ Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (user: UserResponse) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleDeleteClick = (user: UserResponse) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      setDeleting(true)
      await userService.deleteUser(userToDelete.id)
      
      // Remove user from list
      setUsers(users.filter(u => u.id !== userToDelete.id))
      
      // Close modals
      setShowDeleteConfirm(false)
      setShowDetailsModal(false)
      setUserToDelete(null)
      
      // Reload stats
      await loadUsers()
      
      alert('User deleted successfully')
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      alert(err.response?.data?.message || 'Failed to delete user')
      setDeleting(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'HOTEL_MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="size-4" />
      case 'HOTEL_MANAGER':
        return <UsersIcon className="size-4" />
      case 'CUSTOMER':
        return <UserIcon className="size-4" />
      default:
        return <UserIcon className="size-4" />
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
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">ADMINISTRATION</p>
        <h2 className="text-3xl font-serif text-[#183b30] mt-1">User management</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage customers, hotel managers, and access across EventStay.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total users</p>
              <p className="mt-2 text-3xl font-semibold text-[#183b30]">{stats.total.toLocaleString()}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
              <UsersIcon className="size-5" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">{stats.customers.toLocaleString()}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-green-100">
              <UserIcon className="size-5 text-green-600" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hotel managers</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.managers}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-blue-100">
              <UsersIcon className="size-5 text-blue-600" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="mt-2 text-3xl font-semibold text-purple-600">{stats.admins}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-purple-100">
              <Shield className="size-5 text-purple-600" />
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-semibold text-[#183b30]">People and access</h3>
            <p className="mt-1 text-xs text-muted-foreground">Manage your EventStay inventory and operations</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247] w-64"
            />
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#183b30]">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="px-3 py-1.5 text-sm font-medium text-[#276247] hover:bg-[#e8f0eb] rounded transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-[#183b30]">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-serif text-[#183b30]">User Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#183b30]">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)}
                      {selectedUser.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : selectedUser.role.charAt(0) + selectedUser.role.slice(1).toLowerCase()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Email</p>
                  </div>
                  <p className="font-semibold text-[#183b30] break-all">{selectedUser.email}</p>
                  {selectedUser.emailVerified && (
                    <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                  )}
                </div>

                {selectedUser.phoneNumber && (
                  <div className="bg-[#e8f0eb] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase font-medium">Phone</p>
                    </div>
                    <p className="font-semibold text-[#183b30]">{selectedUser.phoneNumber}</p>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="bg-[#e8f0eb] rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground uppercase font-medium">Address</p>
                    </div>
                    <p className="font-semibold text-[#183b30]">{selectedUser.address}</p>
                  </div>
                )}

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Joined</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">User ID</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">#{selectedUser.id}</p>
                </div>
              </div>

              {/* Timestamps */}
              {selectedUser.updatedAt && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-[#183b30] font-medium">
                      {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteClick(selectedUser)}
                className="w-full py-3 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="size-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="size-6 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Delete User?</h2>
            
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Email:</span> {userToDelete.email}
              </p>
              <p className="text-sm text-red-800 mt-1">
                <span className="font-semibold">Role:</span> {userToDelete.role === 'HOTEL_MANAGER' ? 'Hotel Manager' : userToDelete.role.charAt(0) + userToDelete.role.slice(1).toLowerCase()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
