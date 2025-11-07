import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCampaign,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  getAllCampaigns,
} from '../controllers/campaign.controller';
import {
  applyToCampaign,
  getMyApplications,
  getCampaignApplications,
  approveApplication,
  rejectApplication,
  cancelApplication,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules for campaign creation
const createCampaignValidation = [
  body('campaignName')
    .trim()
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Campaign name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('paymentPerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment per day must be a positive number'),
  body('requiredDrivers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Required drivers must be at least 1'),
  body('wrapDesignUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for wrap design'),
  validate,
];

// Validation rules for campaign update
const updateCampaignValidation = [
  body('campaignName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Campaign name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('paymentPerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment per day must be a positive number'),
  body('requiredDrivers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Required drivers must be at least 1'),
  body('wrapDesignUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for wrap design'),
  validate,
];

// Validation rules for status update
const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'active', 'paused', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  validate,
];

// Validation rules for application rejection
const rejectApplicationValidation = [
  param('campaignId').isUUID().withMessage('Invalid campaign ID'),
  param('driverId').isUUID().withMessage('Invalid driver ID'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  validate,
];

const approveApplicationValidation = [
  param('campaignId').isUUID().withMessage('Invalid campaign ID'),
  param('driverId').isUUID().withMessage('Invalid driver ID'),
  validate,
];

const campaignIdValidation = [
  param('campaignId').isUUID().withMessage('Invalid campaign ID'),
  validate,
];

// Protected routes - require authentication
router.use(authenticate);

// ==================== CAMPAIGN MANAGEMENT ROUTES ====================

// Advertiser-specific routes
router.post('/', authorize('advertiser'), createCampaignValidation, createCampaign);
router.get('/my', authorize('advertiser'), getMyCampaigns);
router.put('/:campaignId', authorize('advertiser'), updateCampaignValidation, updateCampaign);
router.delete('/:campaignId', authorize('advertiser'), deleteCampaign);
router.patch('/:campaignId/status', authorize('advertiser'), updateStatusValidation, updateCampaignStatus);

// ==================== APPLICATION ROUTES ====================

// Driver application routes
router.get('/applications/my', authorize('driver'), getMyApplications);
router.post('/:campaignId/apply', authorize('driver'), campaignIdValidation, applyToCampaign);
router.delete('/:campaignId/apply', authorize('driver'), campaignIdValidation, cancelApplication);

// Advertiser application management routes
router.get('/:campaignId/applications', authorize('advertiser'), campaignIdValidation, getCampaignApplications);
router.patch('/:campaignId/applications/:driverId/approve', authorize('advertiser'), approveApplicationValidation, approveApplication);
router.patch('/:campaignId/applications/:driverId/reject', authorize('advertiser'), rejectApplicationValidation, rejectApplication);

// ==================== PUBLIC/DRIVER ROUTES ====================

// Public/Driver routes (authenticated)
router.get('/', getAllCampaigns);
router.get('/:campaignId', getCampaignById);

export default router;
