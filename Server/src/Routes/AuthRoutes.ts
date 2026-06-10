import express, { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    uploadImage,
    updatePassword,
    DeleteAccount,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,
    verifyOTP,
    resendOTP,
    getUploadedImage,
    FcmToken,
    getAllCustomers,
    deleteCustomerById,
    googleAuth,
    getSettings,
    updateSettings,
    toggleUserActiveStatus,
    guestLogin,
    getLastLogin,
    continueLogin,
} from '../Controller/AuthController';
import { protect } from '../Middleware/AuthMiddleWare';
import { authLimiter } from '../Middleware/RateLimitMiddleware';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', authLimiter, register as express.RequestHandler);
router.post('/login', authLimiter, login as express.RequestHandler);
router.post('/guest-login', guestLogin as express.RequestHandler);
router.post('/logout', logout as express.RequestHandler);
router.post('/google', googleAuth as express.RequestHandler);
router.get('/last-login', getLastLogin as express.RequestHandler);
router.post('/continue-login', continueLogin as express.RequestHandler);
router.get('/getme', protect as express.RequestHandler, getMe as express.RequestHandler);
router.put('/updateprofile', protect as express.RequestHandler, updateProfile as express.RequestHandler);
router.post('/upload-image', protect as express.RequestHandler, upload.single('image'), uploadImage as express.RequestHandler);
router.get('/get-uploaded-image', protect as express.RequestHandler, getUploadedImage as express.RequestHandler);
router.put('/update-password', protect as express.RequestHandler, updatePassword as express.RequestHandler);
router.delete('/delete-account', protect as express.RequestHandler, DeleteAccount as express.RequestHandler);
router.post('/fcm-token', protect as express.RequestHandler, FcmToken as express.RequestHandler);
router.post('/forgot-password', authLimiter, sendPasswordResetOTP as express.RequestHandler);
router.post('/verify-reset-otp', authLimiter, verifyPasswordResetOTP as express.RequestHandler);
router.put('/reset-password', authLimiter, resetPassword as express.RequestHandler);
router.post('/resend-reset-otp', authLimiter, resendPasswordResetOTP as express.RequestHandler);
router.post('/verify-otp', authLimiter, verifyOTP as express.RequestHandler);
router.post('/resend-otp', authLimiter, resendOTP as express.RequestHandler);
router.get('/customers', protect as express.RequestHandler, getAllCustomers as express.RequestHandler);
router.delete('/customer/:userId', protect as express.RequestHandler, deleteCustomerById as express.RequestHandler);
router.patch('/users/:userId/toggle-status', protect as express.RequestHandler, toggleUserActiveStatus as express.RequestHandler);
router.get('/settings', protect as express.RequestHandler, getSettings as express.RequestHandler);
router.put('/settings', protect as express.RequestHandler, updateSettings as express.RequestHandler);

export default router;