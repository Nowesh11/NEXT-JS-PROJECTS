import mongoose from 'mongoose';
import { getSession } from 'next-auth/react';
import SlideshowSettings from '../models/SlideshowSettings';

export default async function handler(req, res) {
  // 获取会话信息并验证权限
  const session = await getSession({ req });
  
  // 非GET请求需要身份验证和管理员权限
  if (req.method !== 'GET') {
    if (!session) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 检查用户是否有管理员权限
    if (!session.user.roles || !session.user.roles.includes('admin')) {
      return res.status(403).json({ message: '权限不足，需要管理员权限' });
    }
  }

  // 连接到数据库
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  } catch (error) {
    return res.status(500).json({ message: '数据库连接失败' });
  }

  // 处理GET请求 - 获取幻灯片设置
  if (req.method === 'GET') {
    try {
      // 查找设置，如果不存在则创建默认设置
      let settings = await SlideshowSettings.findOne();
      
      if (!settings) {
        settings = await SlideshowSettings.create({
          general: {
            defaultInterval: 5000,
            defaultAutoPlay: true,
            defaultShowControls: true,
            defaultShowIndicators: true,
            maxSlidesPerShow: 10
          },
          animations: {
            enabled: true,
            defaultAnimation: 'fade',
            defaultDuration: 500
          },
          permissions: {
            allowPublicSubmissions: false,
            requireApproval: true,
            allowedRoles: ['admin', 'editor']
          }
        });
      }
      
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return res.status(500).json({ message: '获取设置失败', error: error.message });
    }
  }
  
  // 处理PUT请求 - 更新幻灯片设置
  if (req.method === 'PUT') {
    try {
      const { general, animations, permissions } = req.body;
      
      // 查找设置，如果不存在则创建默认设置
      let settings = await SlideshowSettings.findOne();
      
      if (!settings) {
        settings = new SlideshowSettings({});
      }
      
      // 更新设置
      if (general) {
        settings.general = {
          ...settings.general,
          ...general
        };
      }
      
      if (animations) {
        settings.animations = {
          ...settings.animations,
          ...animations
        };
      }
      
      if (permissions) {
        settings.permissions = {
          ...settings.permissions,
          ...permissions
        };
      }
      
      await settings.save();
      
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return res.status(500).json({ message: '更新设置失败', error: error.message });
    }
  }
  
  // 处理其他请求方法
  return res.status(405).json({ message: '不支持的请求方法' });
}