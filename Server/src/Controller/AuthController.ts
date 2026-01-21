import { Request, Response, NextFunction } from 'express';
import User from '../Models/Users';
import Cart from '../Models/Cart_Items';
import Order from '../Models/Orders';
import sendToken from '../Utils/jwt';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import * as brevo from '@getbrevo/brevo';
import AdminNotification from '../Models/AdminNotification';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const brevoApi = new brevo.TransactionalEmailsApi();
brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const otpStore = new Map();

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email: string, otp: string, name: string): Promise<void> => {
  console.log(`📧 Attempting to send OTP to: ${email}`);

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_FROM_EMAIL || '',
    name: process.env.BREVO_FROM_NAME || 'TastyHub'
  };
  sendSmtpEmail.subject = 'Verify Your TastyHub Account';
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #ffffff; 
          padding: 20px 15px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          width: 100%;
        }
        .content { 
          padding: 10px 0; 
        }
        .logo { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #2d2d2d; 
        }
        .logo-text { 
          font-size: 24px; 
          font-weight: 700; 
          color: #2d2d2d; 
          letter-spacing: -0.5px; 
        }
        .greeting { 
          font-size: 18px; 
          color: #2d2d2d; 
          margin-bottom: 20px; 
          font-weight: 600; 
        }
        .message { 
          font-size: 15px; 
          color: #666666; 
          line-height: 1.8; 
          margin-bottom: 20px; 
        }
        .otp-section { 
          text-align: center; 
          margin: 30px 0; 
          padding: 30px 15px; 
          border-top: 1px solid #e5e5e5; 
          border-bottom: 1px solid #e5e5e5; 
        }
        .otp-label { 
          font-size: 12px; 
          color: #888888; 
          margin-bottom: 18px; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          font-weight: 600; 
        }
        .otp-code { 
          border: 2px dashed #d0d0d0; 
          padding: 20px 30px; 
          display: inline-block; 
          font-size: 32px; 
          font-weight: 700; 
          color: #2d2d2d; 
          letter-spacing: 8px; 
          margin: 10px 0; 
        }
        .timer-text { 
          font-size: 13px; 
          color: #888888; 
          margin-top: 20px; 
          line-height: 1.6; 
        }
        .divider { 
          height: 1px; 
          background-color: #e5e5e5; 
          margin: 25px 0; 
        }
        .info-box { 
          border-left: 3px solid #2d2d2d; 
          padding: 15px 15px; 
          margin: 25px 0; 
        }
        .info-text { 
          font-size: 14px; 
          color: #666666; 
          line-height: 1.7; 
        }
        .warning { 
          font-size: 13px; 
          color: #888888; 
          line-height: 1.8; 
          margin-top: 25px; 
        }
        .support-link { 
          color: #2d2d2d; 
          text-decoration: underline; 
          font-weight: 500; 
        }
        .footer { 
          text-align: center; 
          padding: 25px 15px 10px; 
          border-top: 2px solid #2d2d2d; 
          margin-top: 30px; 
        }
        .footer-brand { 
          font-size: 18px; 
          font-weight: 600; 
          color: #2d2d2d; 
          margin-bottom: 8px; 
        }
        .footer-text { 
          font-size: 14px; 
          color: #666666; 
          margin-bottom: 15px; 
        }
        .footer-copyright { 
          font-size: 12px; 
          color: #999999; 
          margin-top: 12px; 
          line-height: 1.6; 
        }
        @media only screen and (max-width: 600px) {
          body { 
            padding: 15px 10px; 
          }
          .logo-text { 
            font-size: 20px; 
          }
          .greeting { 
            font-size: 16px; 
          }
          .message { 
            font-size: 14px; 
          }
          .otp-section { 
            padding: 25px 10px; 
            margin: 25px 0; 
          }
          .otp-code { 
            font-size: 28px; 
            padding: 18px 25px; 
            letter-spacing: 6px; 
          }
          .timer-text { 
            font-size: 12px; 
          }
          .info-box { 
            padding: 12px 12px; 
          }
          .info-text { 
            font-size: 13px; 
          }
          .warning { 
            font-size: 12px; 
          }
          .footer-brand { 
            font-size: 16px; 
          }
          .footer-text { 
            font-size: 13px; 
          }
        }
        @media only screen and (max-width: 400px) {
          .logo-text { 
            font-size: 18px; 
          }
          .greeting { 
            font-size: 15px; 
          }
          .message { 
            font-size: 13px; 
          }
          .otp-code { 
            font-size: 24px; 
            padding: 15px 20px; 
            letter-spacing: 5px; 
          }
          .otp-label { 
            font-size: 11px; 
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="content">
          <div class="logo">
            <div class="logo-text">OTP For Email Verification</div>
          </div>
          
          <p class="greeting">Hello ${name},</p>
          <p class="message">Thank you for signing up with TastyHub! We're excited to have you on board.</p>
          <p class="message">To complete your registration and verify your email address, please use the verification code below:</p>
          
          <div class="otp-section">
            <div class="otp-label">Verification Code</div>
            <div class="otp-code">${otp}</div>
            <p class="timer-text">⏱ This code expires in 10 minutes<br>Enter this code to complete your verification</p>
          </div>
          
          <div class="info-box">
            <p class="info-text">Once verified, you'll have full access to explore and order from hundreds of restaurants near you.</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="warning">If you didn't create a TastyHub account, please ignore this email or contact our support team at <a href="mailto:support@tastyhub.com" class="support-link">support@tastyhub.com</a> if you have concerns.</p>
        </div>
        
        <div class="footer">
          <p class="footer-brand">TastyHub</p>
          <p class="footer-text">Your effortless food delivery solution</p>
          <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await brevoApi.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully via Brevo');
    return Promise.resolve();
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    if (error.response) {
      console.error('Brevo Error Details:', error.response.body);
    }
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please enter all fields' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      userData: { name, email, password },
      expiresAt,
    });

    try {
      await sendOTPEmail(email, otp, name);
      console.log(`✅ OTP sent successfully to ${email}: ${otp}`);
      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please check your inbox.',
        email,
      });
    } catch (emailError: any) {
      otpStore.delete(email);
      console.error('Email sending failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check your email address and try again.',
        error: emailError.message,
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  console.log(`📧 Sending welcome email to: ${email}`);

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_FROM_EMAIL || '',
    name: process.env.BREVO_FROM_NAME || 'TastyHub'
  };
  sendSmtpEmail.subject = 'Welcome to TastyHub - Your Account is Ready!';
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #ffffff; 
          padding: 20px 15px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          width: 100%;
        }
        .content { 
          padding: 10px 0; 
        }
        .logo { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #2d2d2d; 
        }
        .logo-text { 
          font-size: 28px; 
          font-weight: 700; 
          color: #2d2d2d; 
          letter-spacing: -0.5px; 
        }
        .greeting { 
          font-size: 18px; 
          color: #2d2d2d; 
          margin-bottom: 20px; 
          font-weight: 600; 
        }
        .message { 
          font-size: 15px; 
          color: #666666; 
          line-height: 1.8; 
          margin-bottom: 20px; 
        }
        .welcome-section { 
          text-align: center; 
          margin: 30px 0; 
          padding: 25px 15px; 
          border-top: 1px solid #e5e5e5; 
          border-bottom: 1px solid #e5e5e5; 
        }
        .welcome-title { 
          font-size: 22px; 
          color: #2d2d2d; 
          font-weight: 700; 
          margin-bottom: 15px; 
        }
        .welcome-text { 
          font-size: 15px; 
          color: #666666; 
          line-height: 1.8; 
        }
        .cta-section { 
          text-align: center; 
          margin: 30px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background-color: #2d2d2d; 
          color: #ffffff !important; 
          text-decoration: none; 
          padding: 14px 35px; 
          border-radius: 8px; 
          font-size: 15px; 
          font-weight: 600; 
        }
        .features-section { 
          margin: 30px 0; 
        }
        .feature-item { 
          padding: 15px 0; 
          margin-bottom: 20px; 
          border-left: 3px solid #2d2d2d; 
          padding-left: 15px; 
        }
        .feature-title { 
          font-size: 16px; 
          color: #2d2d2d; 
          font-weight: 600; 
          margin-bottom: 8px; 
        }
        .feature-text { 
          font-size: 14px; 
          color: #666666; 
          line-height: 1.6; 
        }
        .divider { 
          height: 1px; 
          background-color: #e5e5e5; 
          margin: 25px 0; 
        }
        .support-section { 
          text-align: center; 
          padding: 20px 15px; 
          margin-top: 25px; 
          border-top: 1px solid #e5e5e5; 
        }
        .support-text { 
          font-size: 14px; 
          color: #666666; 
          margin-bottom: 10px; 
        }
        .support-link { 
          color: #2d2d2d; 
          text-decoration: underline; 
          font-weight: 500; 
        }
        .footer { 
          text-align: center; 
          padding: 25px 15px 10px; 
          border-top: 2px solid #2d2d2d; 
          margin-top: 30px; 
        }
        .footer-brand { 
          font-size: 18px; 
          font-weight: 600; 
          color: #2d2d2d; 
          margin-bottom: 8px; 
        }
        .footer-text { 
          font-size: 14px; 
          color: #666666; 
          margin-bottom: 15px; 
        }
        .footer-copyright { 
          font-size: 12px; 
          color: #999999; 
          margin-top: 12px; 
          line-height: 1.6; 
        }
        @media only screen and (max-width: 600px) {
          body { 
            padding: 15px 10px; 
          }
          .logo-text { 
            font-size: 24px; 
          }
          .greeting { 
            font-size: 16px; 
          }
          .message { 
            font-size: 14px; 
          }
          .welcome-section { 
            padding: 20px 10px; 
            margin: 25px 0; 
          }
          .welcome-title { 
            font-size: 20px; 
          }
          .welcome-text { 
            font-size: 14px; 
          }
          .cta-button { 
            padding: 12px 25px; 
            font-size: 14px; 
            display: block;
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
          }
          .feature-title { 
            font-size: 15px; 
          }
          .feature-text { 
            font-size: 13px; 
          }
          .footer-brand { 
            font-size: 16px; 
          }
          .footer-text { 
            font-size: 13px; 
          }
        }
        @media only screen and (max-width: 400px) {
          .logo-text { 
            font-size: 22px; 
          }
          .greeting { 
            font-size: 15px; 
          }
          .message { 
            font-size: 13px; 
          }
          .welcome-title { 
            font-size: 18px; 
          }
          .welcome-text { 
            font-size: 13px; 
          }
          .cta-button { 
            padding: 12px 20px; 
            font-size: 13px; 
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="content">
          <div class="logo">
            <div class="logo-text">TastyHub</div>
          </div>
          
          <p class="greeting">Hello ${name},</p>
          <p class="message">We're thrilled to welcome you to TastyHub! 🎉 Your account has been successfully created and you're all set to start your culinary journey with us.</p>
          
          <div class="welcome-section">
            <div class="welcome-title">Welcome Aboard!</div>
            <p class="welcome-text">Your account is now active and ready to use. Discover amazing restaurants, order your favorite dishes, and enjoy fast delivery right to your doorstep.</p>
          </div>

          <div class="cta-section">
            <a href="${process.env.FRONTEND_URL || 'https://tasty-hub-e-commerce-website.vercel.app/'}" class="cta-button">Start Ordering Now</a>
          </div>

          <p class="message">Here's what you can enjoy with TastyHub:</p>

          <div class="features-section">
            <div class="feature-item">
              <div class="feature-title">🍕 Wide Selection</div>
              <p class="feature-text">Browse through multiple categories to find exactly what you're craving.</p>
            </div>
            <div class="feature-item">
              <div class="feature-title">⚡ Fast Delivery</div>
              <p class="feature-text">Get your food delivered quickly with real-time order tracking every step of the way.</p>
            </div>
            <div class="feature-item">
              <div class="feature-title">💳 Secure Payments</div>
              <p class="feature-text">Enjoy safe and convenient payment options for a hassle-free checkout experience.</p>
            </div>
          </div>

          <div class="divider"></div>

          <p class="message">We're committed to making every meal memorable and providing you with the best food delivery experience possible.</p>

          <div class="support-section">
            <p class="support-text">Have questions or need assistance?</p>
            <p class="support-text">Our support team is here to help at <a href="mailto:support@tastyhub.com" class="support-link">support@tastyhub.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-brand">TastyHub</p>
          <p class="footer-text">Your effortless food delivery solution</p>
          <p class="footer-copyright">© ${new Date().getFullYear()} TastyHub. All rights reserved.<br>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await brevoApi.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Welcome email sent successfully via Brevo');
  } catch (error: any) {
    console.error('❌ Failed to send welcome email:', error);
    if (error.response) {
      console.error('Brevo Error Details:', error.response.body);
    }
  }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Please provide email and OTP' });
      return;
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      res.status(400).json({ success: false, message: 'OTP expired or invalid. Please register again.' });
      return;
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
      return;
    }

    const { name, email: userEmail, password } = storedData.userData;

    const user = await User.create({
      name,
      email: userEmail,
      password,
      role: userEmail === process.env.ADMIN_EMAIL ? 'admin' : 'user',
    });

    await AdminNotification.create({
      type: 'new_user',
      title: 'New User Registered',
      message: `${name} has Created a New Account in Our Platform!`,
      userId: user._id,
      userName: name,
      userEmail: userEmail,
      isRead: false,
    });

    otpStore.delete(email);

    try {
      await sendWelcomeEmail(userEmail, name);
    } catch (emailError) {
      console.error('Welcome email failed, but continuing with registration:', emailError);
    }

    sendToken(user, 201, res);
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide email' });
      return;
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      res.status(400).json({ success: false, message: 'No pending verification for this email. Please register again.' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      ...storedData,
      otp,
      expiresAt,
    });

    try {
      await sendOTPEmail(email, otp, storedData.userData.name);
      console.log(`✅ OTP resent successfully to ${email}: ${otp}`);
      res.status(200).json({
        success: true,
        message: 'OTP resent successfully. Please check your email.',
      });
    } catch (emailError: any) {
      console.error('Email resending failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email. Please try again.',
        error: emailError.message,
      });
    }
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please enter email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    sendToken(user, 200, res);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req: Request, res: Response, next: NextFunction): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        shippingAddress: user.shippingAddress,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadImage = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'user_profiles',
        resource_type: 'auto',
        public_id: `user_${user._id}_${Date.now()}`,
      },
      async (error, result) => {
        if (error) {
          res.status(500).json({ success: false, message: 'Image upload failed' });
          return;
        }

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { image: result?.secure_url },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          image: result?.secure_url,
          user: {
            _id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role,
            image: updatedUser?.image,
            shippingAddress: updatedUser?.shippingAddress,
          },
        });
      }
    );

    const stream = Readable.from(req.file.buffer);
    stream.pipe(uploadStream);
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUploadedImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.image) {
      res.status(404).json({ success: false, message: 'No image found for this user' });
      return;
    }

    res.status(200).json({
      success: true,
      image: user.image,
    });
  } catch (error: any) {
    console.error('Get image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { shippingAddress } = req.body;
    const updateData: any = {};

    if (shippingAddress) updateData.shippingAddress = shippingAddress;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        shippingAddress: updatedUser.shippingAddress,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please enter current and new passwords' });
      return;
    }

    const userWithPassword = await User.findById(user._id).select('+password');

    if (!userWithPassword) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid current password' });
      return;
    }

    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const DeleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({ success: false, message: 'Please enter your password to confirm account deletion' });
      return;
    }

    const userWithPassword = await User.findById(user._id).select('+password');

    if (!userWithPassword) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await userWithPassword.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid password' });
      return;
    }

    if (user.image) {
      try {
        const imageUrl = user.image;
        const publicIdMatch = imageUrl.match(/user_profiles\/user_[^.]+/);
        if (publicIdMatch) {
          await cloudinary.v2.uploader.destroy(publicIdMatch[0]);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    const cartDeletion = await Cart.deleteMany({ user: user._id });
    console.log(`Deleted ${cartDeletion.deletedCount} cart(s) for user ${user._id}`);

    const orderDeletion = await Order.deleteMany({ user: user._id });
    console.log(`Deleted ${orderDeletion.deletedCount} order(s) for user ${user._id}`);

    const userDeletion = await User.findByIdAndDelete(user._id);

    if (!userDeletion) {
      res.status(500).json({ success: false, message: 'Failed to delete user account' });
      return;
    }

    console.log(`Successfully deleted user account: ${user._id}`);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      deletedItems: {
        carts: cartDeletion.deletedCount,
        orders: orderDeletion.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please enter email address' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'Please check your email address' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: 'Please enter email and new password' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const FcmToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fcmToken } = req.body;

    console.log('📱 FCM Token registration request received');
    console.log(`👤 User ID: ${userId}`);
    console.log(`🔑 Token: ${fcmToken ? fcmToken.substring(0, 30) + '...' : 'null'}`);

    if (!userId || !fcmToken) {
      console.log('❌ Missing userId or fcmToken');
      return res.status(400).json({
        success: false,
        message: 'Missing userId or fcmToken'
      });
    }

    const result = await User.updateOne(
      { _id: userId },
      { $addToSet: { fcmTokens: fcmToken } }
    );

    console.log(`✅ FCM token saved - Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);

    const user = await User.findById(userId);
    console.log(`📊 User now has ${user?.fcmTokens?.length || 0} FCM token(s)`);

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      tokenCount: user?.fcmTokens?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
      return;
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error: any) {
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
      return;
    }

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.image) {
      try {
        const imageUrl = user.image;
        const publicIdMatch = imageUrl.match(/user_profiles\/user_[^.]+/);
        if (publicIdMatch) {
          await cloudinary.v2.uploader.destroy(publicIdMatch[0]);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    await Cart.deleteMany({ user: userId });
    await Order.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadImage,
  getUploadedImage,
  updatePassword,
  DeleteAccount,
  verifyEmail,
  resetPassword,
  verifyOTP,
  resendOTP,
  FcmToken,
  getAllCustomers,
  deleteCustomerById
};
