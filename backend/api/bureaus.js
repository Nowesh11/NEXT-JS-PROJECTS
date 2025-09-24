import dbConnect from '../../lib/mongodb';
import UnifiedProject from '../../models/UnifiedProject';

export default async function handler(req, res) {
  const { method, query } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${method} not allowed` 
    });
  }

  await dbConnect();

  try {
    const { type, active_only } = query;

    // Build filter for bureau query
    const filter = {};
    
    if (type && ['project', 'activity', 'initiative'].includes(type)) {
      filter.type = type;
    }

    if (active_only === 'true') {
      filter.status = 'active';
    }

    // Get distinct bureau values
    const bureaus = await UnifiedProject.distinct('bureau', filter);
    
    // Get bureau statistics
    const bureauStats = await UnifiedProject.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$bureau',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          avgProgress: { $avg: '$progress' },
          featured: { $sum: { $cond: ['$featured', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format response with both simple list and detailed stats
    const formattedBureaus = bureauStats.map(stat => ({
      name: stat._id,
      label: stat._id,
      value: stat._id,
      count: stat.total,
      active: stat.active,
      completed: stat.completed,
      draft: stat.draft,
      avgProgress: Math.round(stat.avgProgress || 0),
      featured: stat.featured
    }));

    // Add "All" option at the beginning
    const allOption = {
      name: 'All',
      label: 'All Bureaus',
      value: '',
      count: formattedBureaus.reduce((sum, bureau) => sum + bureau.count, 0),
      active: formattedBureaus.reduce((sum, bureau) => sum + bureau.active, 0),
      completed: formattedBureaus.reduce((sum, bureau) => sum + bureau.completed, 0),
      draft: formattedBureaus.reduce((sum, bureau) => sum + bureau.draft, 0),
      avgProgress: Math.round(
        formattedBureaus.reduce((sum, bureau, _, arr) => sum + bureau.avgProgress, 0) / 
        (formattedBureaus.length || 1)
      ),
      featured: formattedBureaus.reduce((sum, bureau) => sum + bureau.featured, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        bureaus: [allOption, ...formattedBureaus],
        simple: ['', ...bureaus.sort()], // Simple array for basic filtering
        stats: {
          totalBureaus: bureaus.length,
          totalItems: allOption.count,
          activeItems: allOption.active,
          completedItems: allOption.completed,
          draftItems: allOption.draft,
          avgProgress: allOption.avgProgress,
          featuredItems: allOption.featured
        }
      },
      filters: {
        type: type || 'all',
        activeOnly: active_only === 'true'
      }
    });
  } catch (error) {
    console.error('Error fetching bureaus:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bureau options' 
    });
  }
}

// Helper function to get bureau options for a specific type
export async function getBureausByType(type) {
  await dbConnect();
  
  const filter = type ? { type } : {};
  const bureaus = await UnifiedProject.distinct('bureau', filter);
  
  return bureaus.sort();
}

// Helper function to get bureau statistics
export async function getBureauStatistics(type = null, activeOnly = false) {
  await dbConnect();
  
  const filter = {};
  if (type) filter.type = type;
  if (activeOnly) filter.status = 'active';
  
  const stats = await UnifiedProject.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$bureau',
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        avgProgress: { $avg: '$progress' },
        featured: { $sum: { $cond: ['$featured', 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return stats;
}