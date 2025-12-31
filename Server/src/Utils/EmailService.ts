import * as brevo from '@getbrevo/brevo';
import { IOrder, IOrderItem, IShippingAddress } from '../Types';

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY || '';
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  private generateOrderItemsHTML(items: IOrderItem[]): string {
    let html = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e8e8e8;">
        <thead>
          <tr style="background-color: #f9f9f9;">
            <th style="padding: 12px; text-align: left; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Product Name</th>
            <th style="padding: 12px; text-align: center; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Quantity</th>
            <th style="padding: 12px; text-align: right; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Price</th>
            <th style="padding: 12px; text-align: right; font-size: 13px; color: #666666; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Total Price</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item, index) => {
      const itemTotal = item.discount_price * item.quantity;
      html += `
        <tr style="border-bottom: 1px solid #e8e8e8;">
          <td style="padding: 15px 12px; font-size: 14px; color: #2d2d2d; font-weight: 500;">${item.name}</td>
          <td style="padding: 15px 12px; text-align: center; font-size: 14px; color: #666666;">${item.quantity}</td>
          <td style="padding: 15px 12px; text-align: right; font-size: 14px; color: #2d2d2d;">₹${item.discount_price.toFixed(2)}</td>
          <td style="padding: 15px 12px; text-align: right; font-size: 14px; color: #2d2d2d; font-weight: 600;">₹${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  private generateAddressHTML(shippingAddress: IShippingAddress | undefined): string {
    if (!shippingAddress) return '';

    return `
      <div style="background: #f9f9f9; border-radius: 6px; padding: 25px; margin-top: 30px;">
        <h3 style="margin: 0 0 15px 0; font-size: 13px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Delivery Address</h3>
        <div style="font-size: 14px; line-height: 1.8; color: #2d2d2d;">
          <strong style="display: block; margin-bottom: 8px; font-size: 15px;">${shippingAddress.fullName}</strong>
          ${shippingAddress.addressLine1}<br>
          ${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br>` : ''}
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
          ${shippingAddress.country}
        </div>
      </div>
    `;
  }

  private generatePricingHTML(order: any): string {
    const subtotal = order.items.reduce((sum: number, item: IOrderItem) =>
      sum + (item.discount_price * item.quantity), 0);

    return `
      <div style="background: #f9f9f9; border-radius: 6px; padding: 25px; margin-top: 20px;">
        <h3 style="margin: 0 0 20px 0; font-size: 15px; color: #2d2d2d; font-weight: 600; border-bottom: 1px solid #f9f9f9; padding-bottom: 12px;">Payment Details</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #666666;">Subtotal</td>
            <td style="padding: 10px 0; font-size: 14px; color: #2d2d2d; text-align: right; font-weight: 600;">₹ ${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #666666; border-top: 1px solid #d0e8f7;">Shipping</td>
            <td style="padding: 10px 0; font-size: 14px; text-align: right; border-top: 1px solid #d0e8f7;">
              <span style="text-decoration: line-through; color: #999999; font-size: 13px; margin-right: 10px;">₹ 30.00</span>
              <span style="color: #2d2d2d; font-weight: 700; font-size: 14px;">FREE</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0 0; font-size: 16px; color: #2d2d2d; font-weight: 700; border-top: 1px solid #2d2d2d;">Total</td>
            <td style="padding: 15px 0 0 0; font-size: 16px; color: #2d2d2d; text-align: right; font-weight: 700; border-top: 1px solid #2d2d2d;">₹ ${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  async sendOrderConfirmation(order: any): Promise<void> {
    const orderItemsHTML = this.generateOrderItemsHTML(order.items);
    const addressHTML = this.generateAddressHTML(order.shippingAddress);
    const pricingHTML = this.generatePricingHTML(order);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.to = [{
      email: order.user.email,
      name: order.user.name
    }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || '',
      name: process.env.BREVO_FROM_NAME || 'TastyHub'
    };
    sendSmtpEmail.subject = `Order Confirmed - #${order._id}`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
          .preview-text { display: none; max-height: 0; overflow: hidden; opacity: 0; }
          .email-wrapper { background-color: #f5f5f5; padding: 40px 20px; }
          .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background-color: #2d2d2d; color: #ffffff; padding: 40px 40px 35px; text-align: center; }
          .header-icon { font-size: 48px; margin-bottom: 15px; }
          .header h1 { font-size: 26px; font-weight: 600; margin: 0 0 8px 0; }
          .header-subtitle { font-size: 14px; color: #cccccc; margin: 0; }
          .content { padding: 40px; background-color: #ffffff; }
          .greeting { font-size: 16px; color: #2d2d2d; margin-bottom: 15px; font-weight: 600; }
          .message { font-size: 14px; color: #666666; line-height: 1.8; margin-bottom: 25px; }
          .order-summary { background-color: #f9f9f9; border-radius: 6px; padding: 25px; margin: 30px 0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .summary-label { color: #888888; padding-right: "30px"}
          .summary-value { color: #2d2d2d; font-weight: 600; text-align: right}
          .section-title { font-size: 16px; color: #2d2d2d; margin: 35px 0 20px 0; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #eeeeee; }
          .info-box { background-color: #f9f9f9; border-left: 4px solid #2d2d2d; padding: 20px; border-radius: 4px; margin: 30px 0 25px 0; }
          .info-box p { margin: 0; font-size: 13px; line-height: 1.7; color: #666666; }
          .footer { background-color: #2d2d2d; color: #ffffff; text-align: center; padding: 30px 40px; }
          .brand-name { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
          .footer-text { font-size: 13px; color: #cccccc; margin: 5px 0; }
          .footer-copyright { font-size: 11px; color: #999999; margin-top: 15px; }
        </style>
      </head>
      <body>
        <span class="preview-text">Your order #${order._id} has been confirmed. Total: ₹${order.totalAmount.toFixed(2)}. Delivery within 3-5 days.</span>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p class="header-subtitle">Thank you for your order</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${order.user.name},</p>
              <p class="message">We've received your order and are getting it ready. You'll receive another email when your order has been shipped.</p>
              
              <div class="order-summary">
                <div class="summary-row">
                  <span class="summary-label">Order Number: </span>
                  <span class="summary-value">${order._id}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Order Date: </span>
                  <span class="summary-value">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Payment Method: </span>
                  <span class="summary-value">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div class="summary-row" style="margin-bottom: 0;">
                  <span class="summary-label">Order Status: </span>
                  <span class="summary-value">Pending</span>
                </div>
              </div>

              <h3 class="section-title">Order Items</h3>
              ${orderItemsHTML}

              ${pricingHTML}

              ${addressHTML}

              <div class="info-box">
                <p style="margin-bottom: 8px;"><strong style="color: #2d2d2d;">📦 Delivery Information</strong></p>
                <p>Your order will be delivered within 3-5 business days. You'll receive a tracking number once your order ships.</p>
              </div>

              <p class="message">If you have any questions about your order, please don't hesitate to contact our support team.</p>
              <p class="message" style="margin-bottom: 0;">Thank you for choosing TastyHub!</p>
            </div>
            
            <div class="footer">
              <p class="brand-name">TastyHub</p>
              <p class="footer-text">Your effortless food delivery solution</p>
              <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.</p>
              <p class="footer-copyright">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Order confirmation email sent successfully to ${order.user.email} via Brevo`);
    } catch (error: any) {
      console.error('❌ Failed to send order confirmation email:', error);
      if (error.response) {
        console.error('Brevo Error Details:', error.response.body);
      }
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  async sendOrderStatusUpdate(order: any, newStatus: string): Promise<void> {
    const orderItemsHTML = this.generateOrderItemsHTML(order.items);
    const addressHTML = this.generateAddressHTML(order.shippingAddress);
    const pricingHTML = this.generatePricingHTML(order);

    const statusMessages: { [key: string]: { title: string; message: string; emoji: string; color: string } } = {
      'Processing': {
        title: 'Order is Being Prepared',
        message: 'Your order is currently being processed and will be shipped soon.',
        emoji: '⚙️',
        color: '#2d2d2d'
      },
      'Shipped': {
        title: 'Order Has Been Shipped',
        message: 'Great news! Your order is on its way and will arrive soon.',
        emoji: '🚚',
        color: '#2d2d2d'
      },
      'Delivered': {
        title: 'Order Delivered Successfully',
        message: 'Your order has been delivered. We hope you enjoy your meal!',
        emoji: '✅',
        color: '#2d2d2d'
      },
      'Cancelled': {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled as requested. If you have questions, please contact support.',
        emoji: '❌',
        color: '#666666'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: 'Order Status Updated',
      message: `Your order status has been updated to: ${newStatus}`,
      emoji: '📦',
      color: '#2d2d2d'
    };

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.to = [{
      email: order.user.email,
      name: order.user.name
    }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || '',
      name: process.env.BREVO_FROM_NAME || 'TastyHub'
    };
    sendSmtpEmail.subject = `Order Update - #${order._id}`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
          .preview-text { display: none; max-height: 0; overflow: hidden; opacity: 0; }
          .email-wrapper { background-color: #f5f5f5; padding: 40px 20px; }
          .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background-color: #2d2d2d; color: #ffffff; padding: 40px 40px 35px; text-align: center; }
          .header-icon { font-size: 48px; margin-bottom: 15px; }
          .header h1 { font-size: 26px; font-weight: 600; margin: 0 0 8px 0; }
          .header-subtitle { font-size: 14px; color: #cccccc; margin: 0; }
          .content { padding: 40px; background-color: #ffffff; }
          .greeting { font-size: 16px; color: #2d2d2d; margin-bottom: 15px; font-weight: 600; }
          .message { font-size: 14px; color: #666666; line-height: 1.8; margin-bottom: 25px; }
          .status-card { background-color: #f9f9f9; border-left: 4px solid ${statusInfo.color}; padding: 25px; border-radius: 4px; margin: 25px 0; }
          .status-emoji { font-size: 36px; margin-bottom: 12px; }
          .status-title { font-size: 20px; color: #2d2d2d; font-weight: 600; margin: 0 0 10px 0; }
          .status-message { font-size: 14px; color: #666666; margin: 0; line-height: 1.7; }
          .order-summary { background-color: #f9f9f9; border-radius: 6px; padding: 25px; margin: 30px 0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .summary-label { color: #888888; }
          .summary-value { color: #2d2d2d; font-weight: 600; }
          .section-title { font-size: 16px; color: #2d2d2d; margin: 35px 0 20px 0; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #eeeeee; }
          .footer { background-color: #2d2d2d; color: #ffffff; text-align: center; padding: 30px 40px; }
          .brand-name { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
          .footer-text { font-size: 13px; color: #cccccc; margin: 5px 0; }
          .footer-copyright { font-size: 11px; color: #999999; margin-top: 15px; }
        </style>
      </head>
      <body>
        <span class="preview-text">Your order #${order._id} status has been updated to ${newStatus}. Check your email for details.</span>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <div class="header-icon">📦</div>
              <h1>Order Status Update</h1>
              <p class="header-subtitle">Your order has been updated</p>
            </div>
            
            <div class="content">
              <div class="status-card">
                <div class="status-emoji">${statusInfo.emoji}</div>
                <h2 class="status-title">${statusInfo.title}</h2>
                <p class="status-message">${statusInfo.message}</p>
              </div>

              <p class="greeting">Hello ${order.user.name},</p>
              <p class="message">Your order status has been updated to <strong>${newStatus}</strong>.</p>

              <div class="order-summary">
                <div class="summary-row">
                  <span class="summary-label">Order Number</span>
                  <span class="summary-value">#${order._id}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Order Date</span>
                  <span class="summary-value">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="summary-row" style="margin-bottom: 0;">
                  <span class="summary-label">Total Amount</span>
                  <span class="summary-value">₹${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <h3 class="section-title">Order Items</h3>
              ${orderItemsHTML}

              ${pricingHTML}

              ${addressHTML}

              <p class="message" style="margin-top: 30px;">Thank you for choosing TastyHub! If you have any questions, please contact our support team.</p>
            </div>
            
            <div class="footer">
              <p class="brand-name">TastyHub</p>
              <p class="footer-text">Your effortless food delivery solution</p>
              <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.</p>
              <p class="footer-copyright">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Order status update email sent successfully to ${order.user.email} via Brevo`);
    } catch (error: any) {
      console.error('❌ Failed to send order status update email:', error);
      if (error.response) {
        console.error('Brevo Error Details:', error.response.body);
      }
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }
}

export default new EmailService();
