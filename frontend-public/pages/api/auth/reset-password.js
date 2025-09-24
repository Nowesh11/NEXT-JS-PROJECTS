// API route for reset password
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { token, password, confirmPassword, language } = req.body;

    // Validate required fields
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token is required' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password is required' 
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password confirmation is required' 
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Prepare request data for backend
    const requestData = {
      token: token.trim(),
      password,
      language: language || 'en'
    };

    // Call backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const backendData = await backendResponse.json();

    if (backendResponse.ok && backendData.success) {
      return res.status(200).json({
        success: true,
        message: backendData.message || 'Password has been reset successfully',
        data: {
          passwordReset: true,
          userId: backendData.userId,
          redirectUrl: '/login'
        }
      });
    } else {
      // Handle specific error cases
      let statusCode = backendResponse.status;
      let errorMessage = backendData.error || backendData.message || 'Failed to reset password';
      
      // Map backend errors to appropriate status codes and messages
      if (backendData.error === 'INVALID_TOKEN') {
        statusCode = 400;
        errorMessage = 'Invalid or expired reset token';
      } else if (backendData.error === 'TOKEN_EXPIRED') {
        statusCode = 400;
        errorMessage = 'Reset token has expired. Please request a new password reset';
      } else if (backendData.error === 'TOKEN_USED') {
        statusCode = 400;
        errorMessage = 'Reset token has already been used';
      } else if (backendData.error === 'USER_NOT_FOUND') {
        statusCode = 404;
        errorMessage = 'User account not found';
      } else if (backendData.error === 'PASSWORD_SAME') {
        statusCode = 400;
        errorMessage = 'New password must be different from your current password';
      } else if (backendData.error === 'RATE_LIMITED') {
        statusCode = 429;
        errorMessage = 'Too many password reset attempts. Please wait before trying again';
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: backendData.error
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later.',
        error: 'BACKEND_UNAVAILABLE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: 'INTERNAL_ERROR'
    });
  }
}

// Password validation helper
function validatePassword(password) {
  const errors = [];
  const requirements = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  };

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  // Check maximum length
  if (password.length > requirements.maxLength) {
    errors.push(`Password must not exceed ${requirements.maxLength} characters`);
  }

  // Check for uppercase letters
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential
    /^(password|123456|qwerty|admin|letmein|welcome|monkey|dragon)/i // Common passwords
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password is too common or predictable');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

// Password strength calculator
function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Complexity bonus
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
    score += 1;
  }

  // Determine strength level
  let level, color;
  if (score <= 2) {
    level = 'weak';
    color = '#ef4444';
    feedback.push('Use a longer password with mixed characters');
  } else if (score <= 4) {
    level = 'fair';
    color = '#f59e0b';
    feedback.push('Add more character variety for better security');
  } else if (score <= 6) {
    level = 'good';
    color = '#10b981';
    feedback.push('Good password strength');
  } else {
    level = 'strong';
    color = '#059669';
    feedback.push('Excellent password strength');
  }

  return {
    score,
    level,
    color,
    feedback,
    percentage: Math.min((score / 8) * 100, 100)
  };
}

// Token validation helper
function validateResetToken(token) {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Invalid token format' };
  }

  // Basic token format validation (adjust based on your token format)
  if (token.length < 32) {
    return { isValid: false, error: 'Token too short' };
  }

  // Check for valid characters (alphanumeric and some special chars)
  if (!/^[a-zA-Z0-9\-_\.]+$/.test(token)) {
    return { isValid: false, error: 'Invalid token characters' };
  }

  return { isValid: true };
}
