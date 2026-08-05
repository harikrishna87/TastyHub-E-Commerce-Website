import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Product from '../Models/Products';
import FAQ from '../Models/FAQ';
import Coupon from '../Models/Coupon';
import ComboDeal from '../Models/ComboDeal';
import Order from '../Models/Orders';
import Cart from '../Models/Cart_Items';
import jwt from 'jsonwebtoken';
import User from '../Models/Users';
import ChatHistory from '../Models/ChatHistory';

// Instantiate the Google Gemini API client
// We initialize it inside the request or globally, using the environment variable
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Google Gemini API Key is missing or invalid. Please configure GEMINI_API_KEY in Server/.env');
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to extract user if token exists (without forcing 401 error)
const getOptionalUser = async (req: Request) => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) return null;
  try {
    if (!process.env.JWT_SECRET) return null;
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch (error) {
    return null;
  }
};

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }

    // 1. Initialize Gemini Client
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Gemini client initialization failed.',
      });
      return;
    }

    // 2. Resolve optional logged-in user context
    const user = await getOptionalUser(req);
    let userContextText = 'The user is currently a Guest (Not Logged In). Invite them to log in if they ask for orders, wallet, or profile details.';
    let recentOrdersText = 'No orders available (Guest).';
    let activeCartText = 'No active cart available (Guest).';

    if (user) {
      const balance = user.walletBalance !== undefined && user.walletBalance !== null ? user.walletBalance : 0;
      userContextText = `User is Logged In:\n- Name: ${user.name}\n- Email: ${user.email}\n- Wallet Balance: ₹${balance.toFixed(2)}`;

      // Fetch user's active cart
      const cart = await Cart.findOne({ user: user._id });
      if (cart && cart.items.length > 0) {
        activeCartText = cart.items.map(item => `- ${item.name} (${item.category}): Quantity: ${item.quantity}, Price: ₹${item.discount_price}`).join('\n');
      } else {
        activeCartText = 'Cart is currently empty.';
      }

      // Fetch user's recent 5 orders
      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
      if (orders.length > 0) {
        recentOrdersText = orders.map(o => {
          const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const itemsList = o.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
          return `- Order ID: ${o._id}\n  Date: ${dateStr}\n  Status: ${o.deliveryStatus}\n  Items: ${itemsList}\n  Total: ₹${o.totalAmount.toFixed(2)}`;
        }).join('\n\n');
      } else {
        recentOrdersText = 'No past orders found.';
      }
    }

    // 3. Retrieve Context from Database
    const [products, coupons, combos, faqs] = await Promise.all([
      Product.find().select('title price category rating calories description ingredients'),
      Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } }).select('code discountType discountValue minOrderAmount'),
      ComboDeal.find({ isActive: true, endTime: { $gt: new Date() } }).select('name comboPrice products').populate({ path: 'products', select: 'title price' }),
      FAQ.find().select('question answer category')
    ]);

    // Format Products
    const productsContext = products.map(p => {
      const ratingVal = p.rating ? `${p.rating.rate}★ (${p.rating.count} ratings)` : '0★ (0 ratings)';
      const ingredStr = p.ingredients.length > 0 ? `Ingredients: ${p.ingredients.join(', ')}` : '';
      return `- **${p.title}** (${p.category}): Price: ₹${p.price}, Calories: ${p.calories}kcal. Rating: ${ratingVal}. Description: ${p.description}. ${ingredStr}`;
    }).join('\n');

    // Format Coupons
    const couponsContext = coupons.length > 0
      ? coupons.map(c => `- Code: **${c.code}** | ${c.discountValue}${c.discountType === 'percentage' ? '%' : ' INR'} OFF | Min Order: ₹${c.minOrderAmount}`).join('\n')
      : 'No active general coupons available.';

    // Format Combo Deals
    const combosContext = combos.length > 0
      ? combos.map((c: any) => {
          const comboItems = c.products.map((p: any) => p.title).join(' + ');
          return `- Combo Name: **${c.name}** | Price: ₹${c.comboPrice} | Contents: ${comboItems}`;
        }).join('\n')
      : 'No active combo deals available.';

    // Format FAQs
    const faqsContext = faqs.length > 0
      ? faqs.map(f => `[${f.category}] Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : 'No dynamic FAQs retrieved.';

    // 4. Construct System Instruction / System Prompt
    const systemPrompt = `You are Buddy, the premium customer service AI assistant for the TastyHub E-Commerce food ordering application.
Your goal is to assist customers with ordering, restaurant menu recommendations, active discount coupons, checking order statuses, and answering policy queries.

### CONTEXT DATA

#### 1. CUSTOMER SESSIONS & AUTHENTICATION STATUS
${userContextText}

#### 2. CURRENT ACTIVE CART
${activeCartText}

#### 3. RECENT ORDERS
${recentOrdersText}

#### 4. MENU CATALOG
${productsContext}

#### 5. ACTIVE PROMO COUPONS
${couponsContext}

#### 6. ACTIVE COMBO DEALS
${combosContext}

#### 7. VERIFIED STORE POLICY FAQs (From MongoDB)
${faqsContext}

---

### INSTRUCTIONS AND BEHAVIOR RULES:
1. **Formatting**: Always format your response in clean, concise, readable GitHub-style Markdown. Use bullet points and bold headers to make it scannable.
2. **Context Integrity (CRITICAL)**: ONLY answer questions using the facts provided in the CONTEXT DATA above. If a product, coupon, combo, or FAQ is not listed, it does not exist. Do not hallucinate, speculate, or make up prices or policies.
3. **Tone**: Be extremely friendly, polite, and helpful. Use a high-end food-service tone.
4. **Order Assistance**: If a logged-in user asks "where is my order" or "track my order", use the details under "RECENT ORDERS" to give them an exact update. If they are not logged in, politely prompt them to log in using the Login screen.
5. **Recommendations**: When recommending food items, suggest 2-3 specific dishes from the MENU CATALOG, specifying their exact category, price (e.g. ₹299), and calorie count. Ask if they want you to walk them through ordering.
6. **Cart/Checkout Queries**: If they ask about items currently in their cart, check the "CURRENT ACTIVE CART" section.
7. **Coupons/Deals**: If they ask about offers, tell them the exact promo codes and combos currently listed.
8. **Unknowable Questions**: If a user asks a query that is not covered by the context (e.g., "Do you deliver to Mars?"), respond politely saying you don't have information on that and offer to connect them to support (support@tastyhub.com or +91 99887 76655).
`;

    // 5. Structure Chat History for Gemini API
    // Gemini SDK expects: contents: [ { role: 'user'|'model', parts: [{ text: string }] } ]
    const contents: any[] = [];

    // Map history to Gemini's format
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.role && h.parts && h.parts[0] && h.parts[0].text) {
          contents.push({
            role: h.role === 'bot' || h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }],
          });
        } else if (h.role && h.content) {
          contents.push({
            role: h.role === 'bot' || h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.content }],
          });
        }
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // 6. Request Completion from Gemini with Structured Output JSON schema
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual consistency
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: {
              type: 'STRING',
              description: 'The natural language text response to display to the user. Use markdown lists/formatting.'
            },
            actions: {
              type: 'ARRAY',
              description: 'Optional list of actions to trigger on user request (e.g. if the user wants to add multiple items at once).',
              items: {
                type: 'OBJECT',
                properties: {
                  type: {
                    type: 'STRING',
                    enum: ['ADD_TO_CART', 'NONE'],
                    description: 'Action type. Set to ADD_TO_CART if user asks to add an item, otherwise NONE.'
                  },
                  productName: {
                    type: 'STRING',
                    description: 'The exact title of the product to add to cart (must match catalog exactly).'
                  },
                  quantity: {
                    type: 'INTEGER',
                    description: 'Quantity of product to add (default is 1).'
                  }
                },
                required: ['type', 'productName']
              }
            }
          },
          required: ['reply', 'actions']
        }
      }
    });

    const responseJsonStr = response.text || "{}";
    let replyText = "I'm sorry, I couldn't generate a response. Please try again.";
    let addedToCart = false;

    try {
      const parsed = JSON.parse(responseJsonStr);
      replyText = parsed.reply || replyText;

      if (parsed.actions && Array.isArray(parsed.actions)) {
        const cartActions = parsed.actions.filter((act: any) => act.type === 'ADD_TO_CART');

        if (cartActions.length > 0) {
          if (!user) {
            replyText = "Please log in to your account first to add items to your cart! 🔐";
          } else {
            // Find or create user's cart
            let cart = await Cart.findOne({ user: user._id });
            const addedItems: string[] = [];
            const existingItems: string[] = [];
            const notFoundItems: string[] = [];

            for (const act of cartActions) {
              const { productName, quantity = 1 } = act;
              // Find the product in MongoDB
              const foundProduct = await Product.findOne({ title: new RegExp('^' + productName.trim() + '$', 'i') });

              if (!foundProduct) {
                notFoundItems.push(productName);
              } else {
                const cartItem = {
                  name: foundProduct.title,
                  image: foundProduct.image,
                  category: foundProduct.category,
                  description: foundProduct.description || '',
                  quantity: quantity || 1,
                  original_price: foundProduct.price,
                  discount_price: foundProduct.price,
                };

                if (!cart) {
                  cart = new Cart({ user: user._id, items: [cartItem] });
                  addedItems.push(foundProduct.title);
                } else {
                  const exists = cart.items.some(item => item.name.toLowerCase() === foundProduct.title.toLowerCase());
                  if (exists) {
                    existingItems.push(foundProduct.title);
                  } else {
                    cart.items.push(cartItem as any);
                    addedItems.push(foundProduct.title);
                  }
                }
              }
            }

            if (addedItems.length > 0 && cart) {
              await cart.save();
              addedToCart = true;
            }

            // Construct unified user feedback
            const messagesList: string[] = [];
            if (addedItems.length > 0) {
              messagesList.push(`Added **${addedItems.join(', ')}** to your cart! 🛒`);
            }
            if (existingItems.length > 0) {
              messagesList.push(`**${existingItems.join(', ')}** is/are already in your cart.`);
            }
            if (notFoundItems.length > 0) {
              messagesList.push(`Sorry, I couldn't find **${notFoundItems.join(', ')}** on our menu.`);
            }
            replyText = messagesList.join(' ');
          }
        }
      }
    } catch (parseError) {
      console.error('Error parsing structured response:', parseError, responseJsonStr);
      // Fallback
      replyText = responseJsonStr;
    }

    // Save messages to MongoDB ChatHistory collection if user is logged in (enforcing 24h timeline)
    if (user) {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // 1. Remove messages older than 24 hours
        await ChatHistory.updateOne(
          { user: user._id },
          { $pull: { messages: { timestamp: { $lt: twentyFourHoursAgo } } } }
        );

        // 2. Append new message pair
        await ChatHistory.findOneAndUpdate(
          { user: user._id },
          {
            $push: {
              messages: [
                { sender: 'user', text: message, timestamp: new Date() },
                { sender: 'bot', text: replyText, timestamp: new Date() }
              ]
            }
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error('❌ Failed to save chat history to database:', dbError);
      }
    }

    res.status(200).json({
      success: true,
      reply: replyText,
      addedToCart,
    });
  } catch (error: any) {
    console.error('❌ Chatbot controller error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while communicating with the AI chatbot.',
      error: error.message || error,
    });
  }
};

// Fetch user's persistent chat history from MongoDB (filtered for last 24 hours)
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
      return;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Remove messages older than 24 hours on fetch
    await ChatHistory.updateOne(
      { user: userId },
      { $pull: { messages: { timestamp: { $lt: twentyFourHoursAgo } } } }
    );

    const history = await ChatHistory.findOne({ user: userId });
    res.status(200).json({
      success: true,
      messages: history?.messages || [],
    });
  } catch (error: any) {
    console.error('❌ Fetch chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history.',
      error: error.message || error,
    });
  }
};

// Clear user's persistent chat history from MongoDB
export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
      return;
    }

    await ChatHistory.findOneAndDelete({ user: userId });
    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error: any) {
    console.error('❌ Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history.',
      error: error.message || error,
    });
  }
};
