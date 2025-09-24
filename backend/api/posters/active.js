import { connectToDatabase } from '../../../utils/mongodb';
import Poster from '../../../models/Poster';

export default async function handler(req, res) {
  const { method, query } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      message: `Method ${method} not allowed`
    });
  }

  try {
    await connectToDatabase();

    // Get the language preference from query or default to English
    const lang = query.lang || 'en';

    // Find the active and featured poster
    const activePoster = await Poster.findOne({
      'availability.isActive': true,
      'availability.isFeatured': true
    }).sort({ createdAt: -1 });

    if (!activePoster) {
      return res.status(404).json({
        success: false,
        message: 'No active poster found'
      });
    }

    // Increment view count
    activePoster.stats.viewCount += 1;
    await activePoster.save();

    // Format response with language preference
    const formattedPoster = {
      id: activePoster._id,
      title: activePoster.title[lang] || activePoster.title.en,
      description: activePoster.description[lang] || activePoster.description.en,
      artist: activePoster.artist,
      category: activePoster.category,
      tags: activePoster.tags,
      dimensions: activePoster.dimensions,
      image: activePoster.image,
      pricing: activePoster.pricing,
      availability: activePoster.availability,
      printOptions: activePoster.printOptions,
      stats: activePoster.stats,
      seo: {
        metaTitle: activePoster.seo.metaTitle[lang] || activePoster.seo.metaTitle.en,
        metaDescription: activePoster.seo.metaDescription[lang] || activePoster.seo.metaDescription.en,
        keywords: activePoster.seo.keywords
      },
      createdAt: activePoster.createdAt,
      updatedAt: activePoster.updatedAt,
      // Include computed fields
      discountedPrice: activePoster.discountedPrice,
      aspectRatio: activePoster.aspectRatio
    };

    return res.status(200).json({
      success: true,
      data: formattedPoster
    });
  } catch (error) {
    console.error('Get active poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active poster',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}