const { AstrologyCategory, AstrologyService } = require('../models');

/**
 * Get dynamic Astrology categories with their active services
 */
const getCategoriesAndServices = async (req, res) => {
  try {
    const categories = await AstrologyCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
      include: [
        {
          model: AstrologyService,
          as: 'services',
          where: { is_active: true },
          required: false,
          order: [['sort_order', 'ASC']]
        }
      ]
    });

    const allServices = await AstrologyService.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
      include: [
        {
          model: AstrologyCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      categories,
      services: allServices
    });
  } catch (error) {
    console.error('Error fetching astrology categories and services:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve astrology services catalogue.'
    });
  }
};

/**
 * Get single service details by slug
 */
const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await AstrologyService.findOne({
      where: { slug, is_active: true },
      include: [
        {
          model: AstrologyCategory,
          as: 'category'
        }
      ]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Astrology service not found.'
      });
    }

    return res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error fetching service by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load astrology service.'
    });
  }
};

module.exports = {
  getCategoriesAndServices,
  getServiceBySlug
};
