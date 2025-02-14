import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authentication';
import fileUpload from '../middleware/fileUpload';
import {
  getFriendRequests,
  createFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getGroupRequests,
  createGroupRequest,
  acceptGroupRequest,
  rejectGroupRequest,
  getGroupCreationRequests,
  createGroupCreationRequest,
  acceptGroupCreationRequest,
  rejectGroupCreationRequest,
} from '../controllers/requestController';

const requestRouter = express.Router();

// Friend requests
requestRouter.get('/friend_requests', isAuthenticated, getFriendRequests);
requestRouter.post('/friend_requests', isAuthenticated, createFriendRequest);
requestRouter.patch(
  '/friend_requests/accept/:id',
  isAuthenticated,
  acceptFriendRequest,
);
requestRouter.patch(
  '/friend_requests/reject/:id',
  isAuthenticated,
  rejectFriendRequest,
);

// Group requests
requestRouter.get('/group_requests', getGroupRequests);
requestRouter.post('/group_requests', createGroupRequest);
requestRouter.patch('/group_requests/accept/:id', acceptGroupRequest);
requestRouter.patch('/group_requests/reject/:id', rejectGroupRequest);

// Group creation requests
requestRouter.get(
  '/group_creation_requests',
  isAuthenticated,
  isAdmin,
  getGroupCreationRequests,
);
requestRouter.post(
  '/group_creation_requests',
  isAuthenticated,
  fileUpload.fields([
    { name: 'groupImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  createGroupCreationRequest,
);
requestRouter.patch(
  '/group_creation_requests/accept/:id',
  isAuthenticated,
  isAdmin,
  acceptGroupCreationRequest,
);
requestRouter.patch(
  '/group_creation_requests/reject/:id',
  isAuthenticated,
  isAdmin,
  rejectGroupCreationRequest,
);

export default requestRouter;
