import express from 'express';
import { isAuthenticated } from '../middleware/authentication';
import fileUpload from '../middleware/fileUpload';
import {
  getPosts,
  getUserPosts,
  getGroupPosts,
  getPostById,
  getPostHistoryById,
  createPost,
  editPost,
  deletePost,
  addCommentToPost,
  editCommentOnPost,
  deleteCommentFromPost,
  addReactionToPost,
  editReactionOnPost,
  deleteReactionFromPost,
  addReactionToComment,
  editReactionOnComment,
  deleteReactionFromComment,
} from '../controllers/postController';

const postRouter = express.Router();

// Post routes
postRouter.get('/', isAuthenticated, getPosts);
postRouter.get('/user/:id', isAuthenticated, getUserPosts);
postRouter.get('/group/:id', isAuthenticated, getGroupPosts);
postRouter.get('/:id', isAuthenticated, getPostById);
postRouter.get('/:id/history', isAuthenticated, getPostHistoryById);
postRouter.post('/', isAuthenticated, fileUpload.array('images'), createPost);
postRouter.patch('/:id', isAuthenticated, fileUpload.array('images'), editPost);
postRouter.delete('/:id', isAuthenticated, deletePost);

// Comment routes
postRouter.post('/:id/comment', isAuthenticated, addCommentToPost);
postRouter.patch(
  '/:id/comment/:comment_id',
  isAuthenticated,
  editCommentOnPost,
);
postRouter.delete(
  '/:id/comment/:comment_id',
  isAuthenticated,
  deleteCommentFromPost,
);

// Reaction routes
postRouter.post('/:id/reaction', isAuthenticated, addReactionToPost);
postRouter.patch('/:id/reaction/', isAuthenticated, editReactionOnPost);
postRouter.delete('/:id/reaction', isAuthenticated, deleteReactionFromPost);
postRouter.post(
  '/:id/comment/:comment_id/reaction',
  isAuthenticated,
  addReactionToComment,
);
postRouter.patch(
  '/:id/comment/:comment_id/reaction',
  isAuthenticated,
  editReactionOnComment,
);
postRouter.delete(
  '/:id/comment/:comment_id/reaction',
  isAuthenticated,
  deleteReactionFromComment,
);

export default postRouter;
