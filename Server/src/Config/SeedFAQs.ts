import FAQ from '../Models/FAQ';

const initialFAQs = [
  {
    question: "What is your refund policy?",
    answer: "We offer a full refund if the order is cancelled before food preparation starts, or if a wrong or damaged item is delivered. Refunds are processed to your TastyHub wallet instantly or to your original payment mode within 5-7 business days.",
    category: "Refunds & Cancellations"
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 30-45 minutes depending on your distance from the restaurant and current traffic conditions. You can track the real-time progress of your delivery using our visual order tracker on the order history page.",
    category: "Delivery"
  },
  {
    question: "How do I use my wallet balance?",
    answer: "Your wallet balance is automatically available as a payment option during checkout. If your wallet balance is insufficient, you can pay the remaining amount using Razorpay or pre-fund your wallet by buying or redeeming gift cards.",
    category: "Wallet"
  },
  {
    question: "How do I redeem a Gift Card?",
    answer: "To redeem a gift card, head to the 'Dining & Gifting' section or checkout, enter your unique 16-character gift code, and click 'Redeem'. The gift card's value will be instantly added to your wallet balance.",
    category: "Gifting"
  },
  {
    question: "Are there any active discount coupons?",
    answer: "You can find all currently active promo codes and discounts under the 'Deals & Discounts' page. Eligible coupons will also appear as selectable options during your cart checkout process.",
    category: "Promotions"
  },
  {
    question: "How can I filter vegetarian items?",
    answer: "On our store/catalog page, you can use the MNC-style 'Pure Veg' filter pill (located at the top of the menu catalog) to instantly display only vegetarian dishes.",
    category: "Menu & Filtering"
  },
  {
    question: "What are your store operational hours?",
    answer: "TastyHub is open for orders daily from 9:00 AM to 11:00 PM. Administrators can pause ordering at any time in response to high order volumes, which will update the store status on the homepage to 'Paused'.",
    category: "Operational Settings"
  },
  {
    question: "How do delivery executives withdraw earnings?",
    answer: "Delivery executives earn ₹30 per completed delivery. Once their withdrawable balance exceeds the minimum threshold of ₹100, they can submit a withdrawal request specifying their Account Number, IFSC code, and Accountant Name from their portal.",
    category: "Delivery Partners"
  }
];

export const seedFAQs = async () => {
  try {
    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0) {
      console.log('🌱 FAQ collection is empty. Seeding initial FAQs...');
      await FAQ.insertMany(initialFAQs);
      console.log('✅ Successfully seeded initial FAQs.');
    } else {
      console.log(`ℹ️ FAQs already seeded (${faqCount} entries found).`);
    }
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
  }
};
