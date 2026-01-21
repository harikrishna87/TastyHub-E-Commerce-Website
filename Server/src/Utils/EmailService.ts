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
          <tr>
            <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: #333333; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Product</th>
            <th style="padding: 12px 8px; text-align: center; font-size: 13px; color: #333333; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Qty</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: #333333; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Price</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: #333333; font-weight: 600; border-bottom: 2px solid #e8e8e8;">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item) => {
      const itemTotal = item.discount_price * item.quantity;
      html += `
        <tr style="border-bottom: 1px solid #e8e8e8;">
          <td style="padding: 12px 8px; font-size: 14px; color: #000000; font-weight: 500;">${item.name}</td>
          <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #333333;">${item.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #000000;">₹${item.discount_price.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #000000; font-weight: 600;">₹${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  private generateAddressHTML(shippingAddress: IShippingAddress | undefined): string {
    if (!shippingAddress) return '';

    return `
      <div style="border-top: 1px solid #e8e8e8; margin: 25px 0; padding-top: 25px;"></div>
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Delivery Address</h3>
      <div style="font-size: 14px; line-height: 1.8; color: #333333;">
        <strong style="display: block; margin-bottom: 8px; font-size: 15px; color: #000000;">${shippingAddress.fullName}</strong>
        ${shippingAddress.addressLine1}<br>
        ${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br>` : ''}
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </div>
    `;
  }

  private generatePricingHTML(order: any): string {
    const subtotal = order.items.reduce((sum: number, item: IOrderItem) =>
      sum + (item.discount_price * item.quantity), 0);

    return `
      <div style="border-top: 1px solid #e8e8e8; margin: 25px 0; padding-top: 25px;"></div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #666666;">Subtotal</td>
          <td style="padding: 10px 0; font-size: 14px; color: #000000; text-align: right; font-weight: 600;">₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #666666;">Shipping</td>
          <td style="padding: 10px 0; font-size: 14px; text-align: right;">
            <span style="text-decoration: line-through; color: #999999; font-size: 13px; margin-right: 10px;">₹30.00</span>
            <span style="color: #000000; font-weight: 700; font-size: 14px;">FREE</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px 0 0 0; font-size: 16px; color: #000000; font-weight: 700; border-top: 2px solid #000000;">Total</td>
          <td style="padding: 15px 0 0 0; font-size: 16px; color: #000000; text-align: right; font-weight: 700; border-top: 2px solid #000000;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
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
    sendSmtpEmail.subject = `Order Confirmed - ${order._id}`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; padding: 20px 15px; }
          .email-container { max-width: 650px; margin: 0 auto; width: 100%; }
          .content { padding: 10px 0; }
          .logo { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2d2d2d; }
          .logo-text { font-size: 28px; font-weight: 700; color: #2d2d2d; letter-spacing: -0.5px; }
          .page-title { font-size: 24px; color: #000000; font-weight: 700; margin: 0 0 8px 0; text-align: center; }
          .page-subtitle { font-size: 14px; color: #666666; margin: 0 0 25px 0; text-align: center; }
          .greeting { font-size: 18px; color: #2d2d2d; margin-bottom: 15px; font-weight: 600; }
          .message { font-size: 15px; color: #666666; line-height: 1.8; margin-bottom: 20px; }
          .order-summary { border: 1px solid #e8e8e8; padding: 20px 15px; margin: 25px 0; }
          .info-box { border-left: 3px solid #2d2d2d; padding: 15px 15px; margin: 25px 0; }
          .info-box p { margin: 0 0 8px 0; font-size: 14px; line-height: 1.7; color: #333333; }
          .info-box p:last-child { margin-bottom: 0; }
          .footer { text-align: center; padding: 25px 15px 10px; border-top: 2px solid #2d2d2d; margin-top: 30px; }
          .brand-name { font-size: 18px; font-weight: 600; color: #2d2d2d; margin-bottom: 8px; }
          .footer-text { font-size: 14px; color: #666666; margin-bottom: 15px; }
          .footer-copyright { font-size: 12px; color: #999999; margin-top: 12px; line-height: 1.6; }
          @media only screen and (max-width: 600px) {
            body { padding: 15px 10px; }
            .logo-text { font-size: 24px; }
            .page-title { font-size: 20px; }
            .page-subtitle { font-size: 13px; }
            .greeting { font-size: 16px; }
            .message { font-size: 14px; }
            .order-summary { padding: 15px 10px; }
            table th, table td { padding: 10px 5px !important; font-size: 12px !important; }
            .info-box { padding: 12px 12px; }
            .info-box p { font-size: 13px; }
          }
          @media only screen and (max-width: 400px) {
            .logo-text { font-size: 22px; }
            .page-title { font-size: 18px; }
            .greeting { font-size: 15px; }
            .message { font-size: 13px; }
            table th, table td { padding: 8px 4px !important; font-size: 11px !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content">
            <div class="logo">
              <div class="logo-text">TastyHub</div>
            </div>

            <h1 class="page-title">Order Created Successfully 🎉</h1>
            <p class="page-subtitle">Thank you for your order</p>
            
            <p class="greeting">Hello ${order.user.name},</p>
            <p class="message">We've received your order and are getting it ready. You'll receive another email when your order has been shipped.</p>
            
            <div class="order-summary">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-bottom: 20px;">
                <tr>
                  <td style="color:#666666; padding:6px 0;">Order Number:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0; word-break:break-all;">${order._id}</td>
                </tr>
                <tr>
                  <td style="color:#666666; padding:6px 0;">Order Date:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0;">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="color:#666666; padding:6px 0;">Payment Method:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td>
                </tr>
                <tr>
                  <td style="color:#666666; padding:6px 0;">Order Status:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0;">Pending</td>
                </tr>
              </table>

              <div style="border-top: 1px solid #e8e8e8; margin: 20px 0; padding-top: 20px;"></div>

              <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Items</h3>
              ${orderItemsHTML}

              ${pricingHTML}

              ${addressHTML}
            </div>

            <div class="info-box">
              <p><strong style="color: #000000;">Delivery Information</strong></p>
              <p>Your order will be delivered within 3-5 business days. You'll receive a tracking number once your order ships.</p>
            </div>

            <p class="message">If you have any questions about your order, please don't hesitate to contact our support team.</p>
            <p class="message" style="margin-bottom: 0;">Thank you for choosing TastyHub!</p>
          </div>
          
          <div class="footer">
            <p class="brand-name">TastyHub</p>
            <p class="footer-text">Your effortless food delivery solution</p>
            <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
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

    const statusMessages: { [key: string]: { title: string; message: string; icon: string } } = {
      'Processing': {
        title: 'Order is Being Prepared 🔄',
        message: 'Your order is currently being processed and will be shipped soon.',
        icon: '🔄'
      },
      'Shipped': {
        title: 'Order Has Been Shipped 🚚',
        message: 'Great news! Your order is on its way and will arrive soon.',
        icon: '🚚'
      },
      'Delivered': {
        title: 'Order Delivered Successfully 🎉',
        message: 'Your order has been delivered. We hope you enjoy your meal!',
        icon: '🎉'
      },
      'Cancelled': {
        title: 'Order Cancelled ❌',
        message: 'Your order has been cancelled as requested. If you have questions, please contact support.',
        icon: '❌'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: `Order Status Updated 📦`,
      message: `Your order status has been updated to: ${newStatus}`,
      icon: '📦'
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
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; padding: 20px 15px; }
          .email-container { max-width: 650px; margin: 0 auto; width: 100%; }
          .content { padding: 10px 0; }
          .logo { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2d2d2d; }
          .logo-text { font-size: 28px; font-weight: 700; color: #2d2d2d; letter-spacing: -0.5px; }
          .page-title { font-size: 24px; color: #000000; font-weight: 700; margin: 0 0 8px 0; text-align: center; }
          .page-subtitle { font-size: 14px; color: #666666; margin: 0 0 25px 0; text-align: center; }
          .greeting { font-size: 18px; color: #2d2d2d; margin-bottom: 15px; font-weight: 600; }
          .message { font-size: 15px; color: #666666; line-height: 1.8; margin-bottom: 20px; }
          .status-card { border-left: 3px solid #2d2d2d; padding: 20px 15px; margin: 25px 0; }
          .status-title { font-size: 20px; color: #000000; font-weight: 700; margin: 0 0 10px 0; }
          .status-message { font-size: 14px; color: #333333; margin: 0; line-height: 1.7; }
          .order-summary { border: 1px solid #e8e8e8; padding: 20px 15px; margin: 25px 0; }
          .footer { text-align: center; padding: 25px 15px 10px; border-top: 2px solid #2d2d2d; margin-top: 30px; }
          .brand-name { font-size: 18px; font-weight: 600; color: #2d2d2d; margin-bottom: 8px; }
          .footer-text { font-size: 14px; color: #666666; margin-bottom: 15px; }
          .footer-copyright { font-size: 12px; color: #999999; margin-top: 12px; line-height: 1.6; }
          @media only screen and (max-width: 600px) {
            body { padding: 15px 10px; }
            .logo-text { font-size: 24px; }
            .page-title { font-size: 20px; }
            .page-subtitle { font-size: 13px; }
            .greeting { font-size: 16px; }
            .message { font-size: 14px; }
            .status-card { padding: 15px 12px; }
            .status-title { font-size: 18px; }
            .status-message { font-size: 13px; }
            .order-summary { padding: 15px 10px; }
            table th, table td { padding: 10px 5px !important; font-size: 12px !important; }
          }
          @media only screen and (max-width: 400px) {
            .logo-text { font-size: 22px; }
            .page-title { font-size: 18px; }
            .greeting { font-size: 15px; }
            .message { font-size: 13px; }
            .status-title { font-size: 16px; }
            table th, table td { padding: 8px 4px !important; font-size: 11px !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content">
            <div class="logo">
              <div class="logo-text">TastyHub</div>
            </div>

            <h1 class="page-title">Order Status Update 📦</h1>
            <p class="page-subtitle">Your order has been updated</p>

            <div class="status-card">
              <h2 class="status-title">${statusInfo.title}</h2>
              <p class="status-message">${statusInfo.message}</p>
            </div>

            <p class="greeting">Hello ${order.user.name},</p>
            <p class="message">Your order status has been updated to <strong>${newStatus}</strong>.</p>

            <div class="order-summary">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-bottom: 20px;">
                <tr>
                  <td style="color:#666666; padding:6px 0;">Order Number:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0; word-break:break-all;">#${order._id}</td>
                </tr>
                <tr>
                  <td style="color:#666666; padding:6px 0;">Order Date:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0;">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="color:#666666; padding:6px 0;">Total Amount:</td>
                  <td align="right" style="color:#000000; font-weight:600; padding:6px 0;">₹${order.totalAmount.toFixed(2)}</td>
                </tr>
              </table>

              <div style="border-top: 1px solid #e8e8e8; margin: 20px 0; padding-top: 20px;"></div>

              <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Items</h3>
              ${orderItemsHTML}

              ${pricingHTML}

              ${addressHTML}
            </div>

            <p class="message" style="margin-top: 30px;">Thank you for choosing TastyHub! If you have any questions, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p class="brand-name">TastyHub</p>
            <p class="footer-text">Your effortless food delivery solution</p>
            <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
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