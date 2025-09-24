// Permission checking middleware
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      // If no user is authenticated, deny access
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required.' 
        });
      }

      // Admin users have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has the required permission
      const userPermissions = req.user.permissions || [];
      
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Permission denied. Required permission: ${requiredPermission}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking permissions.' 
      });
    }
  };
};

// Check if user owns the resource or is admin
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required.' 
        });
      }

      // Admin users can access all resources
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = req.body[resourceField] || req.params[resourceField];
      
      if (resourceUserId && resourceUserId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only access your own resources.' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking ownership.' 
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkOwnership
};