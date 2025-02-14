import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authentication';
import {
  getUsers,
  getUserById,
  getUserFriendsById,
  getFriendRecommendationsById,
  getUserGroupsById,
  getUserNotificationsById,
  getUserSentFriendRequestsById,
  readNotification,
  unfriendById,
  suspendUser,
  resumeUser,
} from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/', isAuthenticated, getUsers);
userRouter.patch(
  '/notifications/:notificationId',
  isAuthenticated,
  readNotification,
);
userRouter.delete('/unfriend/:id', isAuthenticated, unfriendById);
userRouter.patch('/suspend/:id', isAuthenticated, isAdmin, suspendUser);
userRouter.patch('/resume/:id', isAuthenticated, isAdmin, resumeUser);
userRouter.get('/:id', isAuthenticated, getUserById);
userRouter.get('/:id/friends', isAuthenticated, getUserFriendsById);
userRouter.get(
  '/:id/friends/recommend',
  isAuthenticated,
  getFriendRecommendationsById,
);
userRouter.get('/:id/groups', isAuthenticated, getUserGroupsById);
userRouter.get('/:id/notifications', isAuthenticated, getUserNotificationsById);
userRouter.get(
  '/:id/friend-requests',
  isAuthenticated,
  getUserSentFriendRequestsById,
);

export default userRouter;
