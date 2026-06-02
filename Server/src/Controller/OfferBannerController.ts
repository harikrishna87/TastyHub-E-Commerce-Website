import { Request, Response } from "express";
import OfferBanner from "../Models/OfferBanner";

// Default preset banner slides for automatic database seeding
const defaultBanners = [
  {
    title: "Flat 50% Off On First Order",
    subtitle: "Delicious gourmet meals delivered hot & fresh to you",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
    linkCategory: "Burgers",
    discountText: "WELCOME50",
    isActive: true
  },
  {
    title: "Weekend Combo Feasts",
    subtitle: "Huge discounts on combo thalis and family packs",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&auto=format&fit=crop&q=80",
    linkCategory: "NonVeg",
    discountText: "COMBOFEAST",
    isActive: true
  },
  {
    title: "Sweet Tooth Delights",
    subtitle: "Order chocolate lava cakes, ice creams, and gulab jamuns",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&auto=format&fit=crop&q=80",
    linkCategory: "Desserts",
    discountText: "SWEETCAKE",
    isActive: true
  }
];

// @desc    Get all active banners (seeds defaults if empty)
// @route   GET /api/offers
// @access  Public
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    let banners = await OfferBanner.find({});
    
    // Automatic DB Seeding
    if (banners.length === 0) {
      console.log("🌱 Database is empty of banners. Seeding defaults...");
      await OfferBanner.insertMany(defaultBanners);
      banners = await OfferBanner.find({});
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch banners"
    });
  }
};

// @desc    Create a new offer banner
// @route   POST /api/offers
// @access  Private/Admin
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, image, linkCategory, discountText, isActive } = req.body;

    if (!title || !subtitle || !image || !linkCategory || !discountText) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (title, subtitle, image, linkCategory, discountText)"
      });
    }

    const banner = await OfferBanner.create({
      title,
      subtitle,
      image,
      linkCategory,
      discountText,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: "Offer banner created successfully!",
      data: banner
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create banner"
    });
  }
};

// @desc    Update an offer banner
// @route   PUT /api/offers/:id
// @access  Private/Admin
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let banner = await OfferBanner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Offer banner not found"
      });
    }

    banner = await OfferBanner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Offer banner updated successfully!",
      data: banner
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update banner"
    });
  }
};

// @desc    Delete an offer banner
// @route   DELETE /api/offers/:id
// @access  Private/Admin
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await OfferBanner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Offer banner not found"
      });
    }

    await OfferBanner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Offer banner deleted successfully!"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete banner"
    });
  }
};
