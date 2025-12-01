import sgMail from '@sendgrid/mail';
import { IOrder, IOrderItem, IShippingAddress } from '../Types';

class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY || '';
    sgMail.setApiKey(apiKey);
  }

  private getDeliveryStatusHTML(status: string, orderDate: Date | string): string {
    const isOrdered = true;
    const isShipped = status === 'Shipped' || status === 'Delivered';
    const isDelivered = status === 'Delivered';

    return `
      <div style="margin: 30px 0; padding: 0 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding: 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 500px; position: relative;">
                <tr>
                  <td align="center" width="33.33%" style="padding: 0; position: relative;">
                    <div style="width: 50px; height: 50px; background: #52c41a; border-radius: 50%; margin: 0 auto; display: table; text-align: center; position: relative; z-index: 1;">
                      <span style="display: table-cell; vertical-align: middle; color: #fff; font-size: 20px; font-weight: bold;">✓</span>
                    </div>
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13px; font-weight: bold; color: #000; margin-top: 10px;">Order Confirmed</div>
                  </td>
                  <td align="center" width="33.33%" style="padding: 0; position: relative;">
                    <div style="width: 50px; height: 50px; background: ${isShipped ? '#52c41a' : '#e0e0e0'}; border-radius: 50%; margin: 0 auto; display: table; text-align: center; position: relative; z-index: 1;">
                      <span style="display: table-cell; vertical-align: middle; color: ${isShipped ? '#fff' : '#999'}; font-size: 20px; font-weight: bold;">${isShipped ? '🚚' : ''}</span>
                    </div>
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13px; font-weight: bold; color: ${isShipped ? '#000' : '#999'}; margin-top: 10px;">Shipped</div>
                  </td>
                  <td align="center" width="33.33%" style="padding: 0; position: relative;">
                    <div style="width: 50px; height: 50px; background: ${isDelivered ? '#52c41a' : '#e0e0e0'}; border-radius: 50%; margin: 0 auto; display: table; text-align: center; position: relative; z-index: 1;">
                      <span style="display: table-cell; vertical-align: middle; color: ${isDelivered ? '#fff' : '#999'}; font-size: 20px; font-weight: bold;">${isDelivered ? '📦' : ''}</span>
                    </div>
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13px; font-weight: bold; color: ${isDelivered ? '#000' : '#999'}; margin-top: 10px;">Delivered</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 15px; background: #f5f5f5; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #333; border-radius: 16px;">
                    ${status === 'Pending' ? 'Your order is being prepared. You\'ll receive another email once your order has shipped.' : status === 'Shipped' ? 'Your order is on its way!' : 'Your order has been delivered. Thank you for shopping with us!'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  private generateOrderEmailHTML(
    order: IOrder,
    userEmail: string,
    userName: string
  ): string {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    let itemsHTML = '';
    order.items.forEach((item: IOrderItem) => {
      itemsHTML += `
        <tr>
          <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 12px 0;">${item.name}</td>
          <td align="center" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 12px 0;">${item.quantity}</td>
          <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 12px 0;">₹${item.discount_price.toFixed(2)}</td>
          <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; color: #000; padding: 12px 0;">₹${(item.discount_price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    const shippingAddress = order.shippingAddress;
    const addressHTML = shippingAddress
      ? `
        <tr>
          <td style="padding: 30px 40px; background: #ffffff;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="50%" valign="top" style="padding-right: 20px;">
                  <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 15px; font-size: 15px;">SHIPPING ADDRESS:</div>
                  <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; line-height: 1.6;">
                    <div style="margin-bottom: 4px;">${shippingAddress.fullName}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.addressLine1}</div>
                    ${shippingAddress.addressLine2 ? `<div style="margin-bottom: 4px;">${shippingAddress.addressLine2}</div>` : ''}
                    <div style="margin-bottom: 4px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.country}</div>
                  </div>
                </td>
                <td width="50%" valign="top" style="padding-left: 20px;">
                  <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 15px; font-size: 15px;">BILLING ADDRESS:</div>
                  <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; line-height: 1.6;">
                    <div style="margin-bottom: 4px;">${shippingAddress.fullName}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.addressLine1}</div>
                    ${shippingAddress.addressLine2 ? `<div style="margin-bottom: 4px;">${shippingAddress.addressLine2}</div>` : ''}
                    <div style="margin-bottom: 4px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.country}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style type="text/css">
          img {
            display: block;
            border: 0;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 20px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background: #ffffff; border-bottom: 2px solid #000;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 36px; font-weight: bold; color: #52c41a; letter-spacing: 2px;">🍽️ TastyHub</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background: #f5f5f5; text-align: center;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 18px; font-weight: bold; color: #000; margin-bottom: 20px;">Thank you for your order, ${userName}</div>
                    ${this.getDeliveryStatusHTML('Pending', order.createdAt)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 20px;">
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">ORDER NUMBER:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; margin-bottom: 20px;">${order._id}</div>
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">BILLING INFO:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} ₹${order.totalAmount.toFixed(2)}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 20px;">
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">ORDER DATE:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px;">${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${addressHTML}
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid #e0e0e0;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 13px; text-align: center;">See an issue? <a href="#" style="color: #0066cc; text-decoration: underline;">Cancel your order</a></div>
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 12px; color: #666; text-align: center;">Orders can be cancelled within 30 minutes of placement.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid #e0e0e0;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 20px; font-size: 16px; text-align: center;">ORDER SUMMARY</div>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <thead>
                        <tr>
                          <th align="left" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; color: #000; padding: 12px 0; border-bottom: 2px solid #e0e0e0;">Product Name</th>
                          <th align="center" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; color: #000; padding: 12px 0; border-bottom: 2px solid #e0e0e0;">Quantity</th>
                          <th align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; color: #000; padding: 12px 0; border-bottom: 2px solid #e0e0e0;">Price</th>
                          <th align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; color: #000; padding: 12px 0; border-bottom: 2px solid #e0e0e0;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHTML}
                      </tbody>
                    </table>
                    <div style="height: 1px; background: #e0e0e0; margin: 30px 0;"></div>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">SHIPPING TOTAL</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">
                          <span style="text-decoration: line-through; color: #999;">₹30.00</span>
                          <span style="color: #52c41a; font-weight: bold; margin-left: 8px;">FREE DELIVERY</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">TAX</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">₹0.00</td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0; border-bottom: 1px solid #ccc;">GST</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0; border-bottom: 1px solid #ccc;">₹0.00</td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 16px; font-weight: bold; color: #000; padding: 12px 0;">ORDER TOTAL</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 16px; font-weight: bold; color: #000; padding: 12px 0;">₹${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background: #000; padding: 20px; text-align: center;">
                    <p style="font-family: 'Times New Roman', Times, serif; color: #fff; margin: 0; font-size: 12px;">This is an automated email, please do not reply to this message.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateEmailHTML(
    order: IOrder,
    userName: string,
    newStatus: string
  ): string {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const shippingAddress = order.shippingAddress;
    const addressHTML = shippingAddress
      ? `
        <tr>
          <td style="padding: 30px 40px; background: #ffffff;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="50%" valign="top" style="padding-right: 20px;">
                  <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 15px; font-size: 15px;">SHIPPING ADDRESS:</div>
                  <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; line-height: 1.6;">
                    <div style="margin-bottom: 4px;">${shippingAddress.fullName}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.addressLine1}</div>
                    ${shippingAddress.addressLine2 ? `<div style="margin-bottom: 4px;">${shippingAddress.addressLine2}</div>` : ''}
                    <div style="margin-bottom: 4px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.country}</div>
                  </div>
                </td>
                <td width="50%" valign="top" style="padding-left: 20px;">
                  <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 15px; font-size: 15px;">BILLING ADDRESS:</div>
                  <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; line-height: 1.6;">
                    <div style="margin-bottom: 4px;">${shippingAddress.fullName}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.addressLine1}</div>
                    ${shippingAddress.addressLine2 ? `<div style="margin-bottom: 4px;">${shippingAddress.addressLine2}</div>` : ''}
                    <div style="margin-bottom: 4px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
                    <div style="margin-bottom: 4px;">${shippingAddress.country}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
        <style type="text/css">
          img {
            display: block;
            border: 0;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 20px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background: #ffffff">
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 36px; font-weight: bold; color: #52c41a; letter-spacing: 2px;">🍽️ TastyHub</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background: #f5f5f5; text-align: center;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 18px; font-weight: bold; color: #000; margin-bottom: 20px;">Order Status Update, ${userName}</div>
                    ${this.getDeliveryStatusHTML(newStatus, order.createdAt)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 20px;">
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">ORDER NUMBER:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px; margin-bottom: 20px;">${order._id}</div>
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">BILLING INFO:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} ₹${order.totalAmount.toFixed(2)}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 20px;">
                          <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 5px; font-size: 15px;">ORDER DATE:</div>
                          <div style="font-family: 'Times New Roman', Times, serif; color: #000; font-size: 14px;">${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${addressHTML}
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid #e0e0e0;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-weight: bold; color: #000; margin-bottom: 20px; font-size: 16px; text-align: center;">YOUR PAYMENT SUMMARY</div>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">SHIPPING TOTAL</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">
                          <span style="text-decoration: line-through; color: #999;">₹30.00</span>
                          <span style="color: #52c41a; font-weight: bold; margin-left: 8px;">FREE DELIVERY</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">TAX</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0;">₹0.00</td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0; border-bottom: 1px solid #ccc;">GST</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; padding: 8px 0; border-bottom: 1px solid #ccc;">₹0.00</td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Times New Roman', Times, serif; font-size: 16px; font-weight: bold; color: #000; padding: 12px 0;">ORDER TOTAL</td>
                        <td align="right" style="font-family: 'Times New Roman', Times, serif; font-size: 16px; font-weight: bold; color: #000; padding: 12px 0;">₹${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background: #000; padding: 20px; text-align: center;">
                    <p style="font-family: 'Times New Roman', Times, serif; color: #fff; margin: 0; font-size: 12px;">This is an automated email, please do not reply to this message.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendOrderConfirmation(
    userEmail: string,
    userName: string,
    order: IOrder
  ): Promise<boolean> {
    try {
      const emailHTML = this.generateOrderEmailHTML(order, userEmail, userName);
      const msg = {
        to: userEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || '',
          name: process.env.SENDGRID_FROM_NAME || ''
        },
        subject: `Order Confirmation - Order #${order._id}`,
        html: emailHTML,
      };

      await sgMail.send(msg);
      console.log(`Order confirmation email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdate(
    userEmail: string,
    userName: string,
    order: IOrder,
    newStatus: string
  ): Promise<boolean> {
    try {
      const emailHTML = this.generateStatusUpdateEmailHTML(order, userName, newStatus);
      const msg = {
        to: userEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || '',
          name: process.env.SENDGRID_FROM_NAME || ''
        },
        subject: `Order Update - ${newStatus} - Order #${order._id}`,
        html: emailHTML,
      };

      await sgMail.send(msg);
      console.log(`Order status update email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }
  }
}

export default new EmailService();