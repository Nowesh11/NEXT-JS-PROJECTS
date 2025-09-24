import { useSession } from 'next-auth/react'
import { ROLES, hasPermission } from '../lib/auth'

export const usePermissions = () => {
  const { data: session } = useSession()
  
  const userRole = session?.user?.role || ROLES.USER
  
  const checkPermission = (requiredRole) => {
    return hasPermission(userRole, requiredRole)
  }
  
  const permissions = {
    // Super Admin permissions
    canManageUsers: checkPermission(ROLES.SUPER_ADMIN),
    canManageAdmins: checkPermission(ROLES.SUPER_ADMIN),
    canAccessAnalytics: checkPermission(ROLES.SUPER_ADMIN),
    canManageSystemSettings: checkPermission(ROLES.SUPER_ADMIN),
    
    // Admin permissions
    canManageContent: checkPermission(ROLES.ADMIN),
    canManageBooks: checkPermission(ROLES.ADMIN),
    canManageEbooks: checkPermission(ROLES.ADMIN),
    canManageProjects: checkPermission(ROLES.ADMIN),
    canManageTeam: checkPermission(ROLES.ADMIN),
    canManagePosters: checkPermission(ROLES.ADMIN),
    canManageAnnouncements: checkPermission(ROLES.ADMIN),
    canManagePayments: checkPermission(ROLES.ADMIN),
    canManageSlideshow: checkPermission(ROLES.ADMIN),
    canManageWebsiteContent: checkPermission(ROLES.ADMIN),
    canExportData: checkPermission(ROLES.ADMIN),
    
    // Moderator permissions
    canViewReports: checkPermission(ROLES.MODERATOR),
    canModerateChats: checkPermission(ROLES.MODERATOR),
    canModerateComments: checkPermission(ROLES.MODERATOR),
    canViewUserActivity: checkPermission(ROLES.MODERATOR),
    
    // Basic permissions
    canAccessDashboard: checkPermission(ROLES.MODERATOR),
    canViewContent: checkPermission(ROLES.USER)
  }
  
  return {
    userRole,
    checkPermission,
    ...permissions
  }
}

export default usePermissions