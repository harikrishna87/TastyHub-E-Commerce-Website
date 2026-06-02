import { Request, Response } from "express";
import Restaurant from "../Models/Restaurant";

// Default preset restaurants for automatic database seeding
const defaultRestaurants = [
  {
    name: 'Biryani Palace',
    category: 'NonVeg',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Hyderabadi Biryani', 'Mughlai', 'Kebabs'],
    rating: 4.8,
    reviewsCount: '1.2k+',
    deliveryTime: '25-30 min',
    costForTwo: '₹350 for two',
    offer: '40% OFF UP TO ₹100',
    popularDish: 'Special Chicken Dum Biryani',
    isVeg: false,
  },
  {
    name: 'Pizza Express',
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Neapolitan Pizza', 'Italian', 'Garlic Bread'],
    rating: 4.7,
    reviewsCount: '800+',
    deliveryTime: '20-25 min',
    costForTwo: '₹500 for two',
    offer: 'BUY 1 GET 1 FREE',
    popularDish: 'Double Cheese Margherita',
    isVeg: true,
  },
  {
    name: 'Burger Bistro',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Smash Burgers', 'American Fast Food', 'Fries'],
    rating: 4.6,
    reviewsCount: '950+',
    deliveryTime: '15-20 min',
    costForTwo: '₹300 for two',
    offer: 'FREE DELIVERY',
    popularDish: 'Gourmet Cheese Bacon Burger',
    isVeg: false,
  },
  {
    name: 'Vedic Delights',
    category: 'Veg',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Pure Veg', 'North Indian', 'Healthy Salads'],
    rating: 4.9,
    reviewsCount: '500+',
    deliveryTime: '30-35 min',
    costForTwo: '₹280 for two',
    offer: 'FLAT 20% OFF',
    popularDish: 'Special Paneer Butter Masala Thali',
    isVeg: true,
  },
  {
    name: 'Dessert Haven',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Premium Cakes', 'Belgian Waffles', 'Sundaes'],
    rating: 4.8,
    reviewsCount: '650+',
    deliveryTime: '15-25 min',
    costForTwo: '₹250 for two',
    offer: 'FLAT ₹50 OFF',
    popularDish: 'Triple Chocolate Lava Cake',
    isVeg: true,
  },
  {
    name: 'Sweet Symphony',
    category: 'Sweets',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Bengali Sweets', 'Traditional Mithai'],
    rating: 4.7,
    reviewsCount: '700+',
    deliveryTime: '20-30 min',
    costForTwo: '₹200 for two',
    offer: '15% OFF ON ORDERS ABOVE ₹199',
    popularDish: 'Premium Kesar Rasgulla',
    isVeg: true,
  },
  {
    name: 'Fruit Juice Hub',
    category: 'Fruit Juice',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Fresh Fruit Juices', 'Detox Shakes', 'Fruit Bowls'],
    rating: 4.5,
    reviewsCount: '300+',
    deliveryTime: '10-15 min',
    costForTwo: '₹150 for two',
    offer: 'GET 10% OFF ALL BEVERAGES',
    popularDish: 'Immunity Booster Orange Mix',
    isVeg: true,
  },
  {
    name: 'Ice Cream Paradise',
    category: 'IceCream',
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Italian Gelatos', 'Ice Cream Tubs', 'Waffle Cones'],
    rating: 4.8,
    reviewsCount: '450+',
    deliveryTime: '10-15 min',
    costForTwo: '₹220 for two',
    offer: 'BUY 2 GET 1 FREE',
    popularDish: 'Signature Roasted Almond Gelato',
    isVeg: true,
  }
];

// @desc    Get all restaurants (seeds defaults if empty)
// @route   GET /api/restaurants
// @access  Public
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    // Database correction check for Ice Cream image
    await Restaurant.updateMany(
      { name: 'Ice Cream Paradise', image: { $ne: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&auto=format&fit=crop&q=80' } },
      { image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=600&auto=format&fit=crop&q=80' }
    );

    let restaurants = await Restaurant.find({});
    
    // Automatic DB Seeding
    if (restaurants.length === 0) {
      console.log("🌱 Database is empty of restaurants. Seeding defaults...");
      await Restaurant.insertMany(defaultRestaurants);
      restaurants = await Restaurant.find({});
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch restaurants"
    });
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      image,
      cuisines,
      rating,
      reviewsCount,
      deliveryTime,
      costForTwo,
      offer,
      popularDish,
      isVeg
    } = req.body;

    if (!name || !category || !image || !deliveryTime || !costForTwo) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, category, image, deliveryTime, costForTwo)"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      category,
      image,
      cuisines: Array.isArray(cuisines) ? cuisines : (cuisines ? cuisines.split(',').map((c: string) => c.trim()) : []),
      rating: rating || 4.5,
      reviewsCount: reviewsCount || '100+',
      deliveryTime,
      costForTwo,
      offer: offer || '',
      popularDish: popularDish || '',
      isVeg: isVeg !== undefined ? isVeg : true
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully!",
      data: restaurant
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create restaurant"
    });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const { cuisines } = req.body;
    const updateData = { ...req.body };
    
    // Correctly process cuisines array if it's sent as a comma separated string
    if (cuisines && typeof cuisines === 'string') {
      updateData.cuisines = cuisines.split(',').map((c: string) => c.trim());
    }

    restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully!",
      data: restaurant
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update restaurant"
    });
  }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    await Restaurant.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully!"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete restaurant"
    });
  }
};
