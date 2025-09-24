import { getSession } from 'next-auth/react';
import axios from 'axios';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // 验证用户是否已登录
  if (!session) {
    return res.status(401).json({ message: '未授权访问' });
  }
  
  // 验证用户是否有管理员权限
  if (!session.user.roles || !session.user.roles.includes('admin')) {
    return res.status(403).json({ message: '权限不足，需要管理员权限' });
  }

  const backendUrl = `${process.env.BACKEND_URL}/api/slideshow-settings`;
  
  try {
    if (req.method === 'GET') {
      const response = await axios.get(backendUrl, {
        headers: {
          Cookie: req.headers.cookie || ''
        }
      });
      
      return res.status(200).json(response.data);
    } 
    else if (req.method === 'PUT') {
      const response = await axios.put(backendUrl, req.body, {
        headers: {
          Cookie: req.headers.cookie || ''
        }
      });
      
      return res.status(200).json(response.data);
    }
    
    return res.status(405).json({ message: '不支持的请求方法' });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || '服务器错误';
    
    return res.status(statusCode).json({ message: errorMessage });
  }
}