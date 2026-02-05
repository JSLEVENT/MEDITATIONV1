import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import sessionRoutes from './sessions';
import subscriptionRoutes from './subscriptions';
import webhookRoutes from './webhooks';
import audioRoutes from './audio';
import waitlistRoutes from './waitlist';
import analyticsRoutes from './analytics';
import notificationsRoutes from './notifications';
import healthRoutes from './health';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/audio', audioRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);

export default router;
