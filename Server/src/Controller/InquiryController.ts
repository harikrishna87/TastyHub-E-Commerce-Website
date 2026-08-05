import { Request, Response } from 'express';
import Inquiry from '../Models/Inquiry';
import EmailService from '../Utils/EmailService';

// Submit a new contact inquiry (Public)
export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullname, email, phone, preferredDish, dietaryRestrictions, orderType, message, guestCount, eventDate } = req.body;

    if (!fullname || !email || !phone || !preferredDish || !dietaryRestrictions || !orderType || !message) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const newInquiry = new Inquiry({
      fullname,
      email,
      phone,
      preferredDish,
      dietaryRestrictions,
      orderType,
      message,
      guestCount: guestCount || 1,
      eventDate: eventDate || '',
    });

    await newInquiry.save();

    // Trigger asynchronous emails so customer gets a confirmation and admin is notified
    EmailService.sendContactInquiryEmail(newInquiry).catch(err => console.error('Failed to notify admin:', err));
    EmailService.sendInquiryConfirmationToCustomer(newInquiry).catch(err => console.error('Failed to confirm to customer:', err));

    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully and saved to database.',
      inquiry: newInquiry,
    });
  } catch (error: any) {
    console.error('❌ Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact inquiry.',
      error: error.message || error,
    });
  }
};

// Retrieve all customer inquiries (Admin only)
export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error: any) {
    console.error('❌ Fetch inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.',
      error: error.message || error,
    });
  }
};

// Reply to a customer inquiry (Admin only)
export const replyToInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || replyMessage.trim() === '') {
      res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
      return;
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      res.status(404).json({ success: false, message: 'Inquiry not found.' });
      return;
    }

    inquiry.status = 'Replied';
    inquiry.adminReply = replyMessage;
    await inquiry.save();

    // Trigger transactional reply email to the customer
    EmailService.sendInquiryReplyToCustomer(inquiry, replyMessage).catch((emailErr) => {
      console.error('❌ Failed to email admin response to customer:', emailErr);
    });

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully and logged in database.',
      inquiry,
    });
  } catch (error: any) {
    console.error('❌ Reply inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply to customer.',
      error: error.message || error,
    });
  }
};
