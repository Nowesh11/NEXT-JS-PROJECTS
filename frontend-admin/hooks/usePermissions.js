import { useSession } from 'next-auth/react'

export const usePermissions = () => {
  const { data: session } = useSession()
  const user = session?.user
  
  return {
    user,
    isAdmin: user?.role === 'admin' || true, // For now, all authenticated users are admin
    canEdit: user?.role === 'admin' || true,
    canDelete: user?.role === 'admin' || true,
    canCreate: user?.role === 'admin' || true
  }
}

export default usePermissions