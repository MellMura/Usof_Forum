const express = require('express');
const userController = require('../controllers/userController');
const blockController = require('../controllers/blockController');
const { avatarUpload, handleMulterError } = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');


const router = express.Router();

router.post('/:targetId/block', requireAuth, blockController.blockUser);
router.delete('/:targetId/block', requireAuth, blockController.unblockUser);

//router.get('/blocked-by', blockController.listWhoBlockedMe);
//router.get('/:targetId/block', blockController.getBlockStatus);

router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUserById);
router.post('/', requireAdmin, userController.createUser);
router.patch(
    '/avatar',
    requireAuth,
    avatarUpload,
    handleMulterError,
    (req, res, next) => {
      console.log('method:', req.method);
      console.log('CT:', req.headers['content-type']);
      console.log('len:', req.headers['content-length']);
      console.log('file:', req.file);
      console.log('body keys:', Object.keys(req.body || {}));
      next();
    },
    userController.uploadAvatar
  );
  
router.post(
  '/:user_id/avatar',
  requireAdmin,
  avatarUpload,
  handleMulterError,
  userController.uploadAvatarAdmin
);

router.patch('/:user_id', requireAuth, userController.updateUser);
router.delete('/:user_id', requireAdmin, userController.deleteUser);
router.delete('/:user_id/avatar', requireAuth, userController.deleteAvatar);

module.exports = router;
