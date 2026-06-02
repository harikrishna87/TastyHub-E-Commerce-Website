import { Request, Response } from "express";
import OfferBanner from "../Models/OfferBanner";

// Default preset banner slides for automatic database seeding
const defaultBanners = [
  {
    title: "Royal Biryani Feast",
    subtitle: "Experience the rich, authentic flavors of slow-cooked gourmet biryanis.",
    image: "/biryani_banner.png",
    linkCategory: "NonVeg",
    discountText: "ROYALBIRYANI",
    isActive: true
  },
  {
    title: "Gourmet Craft Burgers",
    subtitle: "Juicy hand-pressed patties, toasted brioche buns, and house-made sauces.",
    image: "/burgers_banner.png",
    linkCategory: "Burgers",
    discountText: "BURGERCRUSH",
    isActive: true
  },
  {
    title: "Woodfired Artisanal Pizzas",
    subtitle: "Hand-stretched dough baked to perfection in traditional stone ovens.",
    image: "/pizzas_banner.png",
    linkCategory: "Pizzas",
    discountText: "PIZZALOVE",
    isActive: true
  },
  {
    title: "Sweet Tooth Delights",
    subtitle: "Indulge in premium molten cakes, artisanal gelatos, and traditional sweets.",
    image: "/desserts_banner.png",
    linkCategory: "Desserts",
    discountText: "SWEETCAKE",
    isActive: true
  },
  {
    title: "Fresh Garden Harvest",
    subtitle: "Nutrient-dense, organic green bowls and pure vegetarian specialties.",
    image: "/veg_banner.png",
    linkCategory: "Veg",
    discountText: "HEALTHYVEG",
    isActive: true
  }
];

// @desc    Get all active banners (seeds defaults if empty)
// @route   GET /api/offers
// @access  Public
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    let banners = await OfferBanner.find({});
    
    // Check if the database has old placeholder banners and upgrade them
    const hasOldBanners = banners.some(
      (b) =>
        b.title === "Flat 50% Off On First Order" ||
        b.title === "Weekend Combo Feasts" ||
        b.image.includes("unsplash.com")
    );

    // Automatic DB Seeding & Upgrade
    if (banners.length === 0 || hasOldBanners) {
      console.log("🌱 Resetting and seeding new custom gourmet banners...");
      await OfferBanner.deleteMany({});
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
