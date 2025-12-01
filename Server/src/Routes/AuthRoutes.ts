import express, { Router } from 'express';
import { register, login, logout, getMe, updateProfile, uploadImage, updatePassword, DeleteAccount, verifyEmail, resetPassword, verifyOTP, resendOTP, getUploadedImage, FcmToken} from '../Controller/AuthController';
import { protect } from '../Middleware/AuthMiddleWare';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', logout as express.RequestHandler);
router.get('/getme', protect as express.RequestHandler, getMe as express.RequestHandler);
router.put('/updateprofile', protect as express.RequestHandler, updateProfile as express.RequestHandler);
router.post('/upload-image', protect as express.RequestHandler, upload.single('image'), uploadImage as express.RequestHandler);
router.get('/get-uploaded-image', protect as express.RequestHandler, getUploadedImage as express.RequestHandler);
router.put('/update-password', protect as express.RequestHandler, updatePassword as express.RequestHandler);
router.delete('/delete-account', protect as express.RequestHandler, DeleteAccount as express.RequestHandler);
router.post('/fcm-token', protect as express.RequestHandler, FcmToken as express.RequestHandler)
router.post('/verify-email', verifyEmail as express.RequestHandler);
router.put('/reset-password', resetPassword as express.RequestHandler);
router.post('/verify-otp', verifyOTP as express.RequestHandler);
router.post('/resend-otp', resendOTP as express.RequestHandler);

export default router;