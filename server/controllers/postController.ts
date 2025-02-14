import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/post';
import User from '../models/user';
import Group from '../models/group';

// Get posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    const { page = 1, limit = 10 } = req.query;

    // Pagination setup
    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    let postsQuery;

    if (isAdmin) {
      // Admin: Get all posts in the database
      postsQuery = Post.find({});
    } else {
      // Current User: Get posts from friends and groups
      const user = await User.findById(userId).select('friends').exec();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's friends and groups
      const friendIds = user.friends.map((friend) => friend._id);

      const userGroups = await Group.find({ members: userId })
        .select('_id')
        .exec();
      const groupIds = userGroups.map((group) => group._id);

      // Find posts from friends and groups
      postsQuery = Post.find({
        $or: [
          // { visibility: "Public" },
          { user_id: { $in: friendIds } },
          { user_id: userId },
          { group_id: { $in: groupIds } },
        ],
      });
    }

    // Execute the query and process the results
    const posts = await postsQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select(
        '_id user_id group_id content images visibility reactions comments createdAt',
      )
      .populate({
        path: 'user_id',
        select: '_id username displayName profileImage contentType',
      })
      .populate({
        path: 'comments.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'reactions.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'comments.reactions.author_id', // Populates the author of each reaction in comments
        select: '_id username displayName profileImage',
      })
      .exec();

    // Sort the comments by createdAt in descending order (latest first)
    posts.map((post) =>
      post.comments.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    );

    // Remove duplicate posts (based on _id)
    const uniquePosts = posts.filter(
      (post, index, self) =>
        index ===
        self.findIndex((p) => p._id.toString() === post._id.toString()),
    );

    // Process virtual images to be included in the response
    const processedPosts = uniquePosts.map((post) => {
      const user = post.user_id as any;

      // Manually create the virtualProfileImage
      const virtualProfileImage =
        user.profileImage && user.profileImage.data
          ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
          : null;

      return {
        _id: post._id,
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          virtualProfileImage,
        },
        group_id: post.group_id,
        content: post.content,
        // @ts-ignore
        images: post.virtualImages,
        visibility: post.visibility,
        reactions: post.reactions,
        comments: post.comments,
        createdAt: post.createdAt,
      };
    });

    return res.status(200).json(processedPosts);
  } catch (error) {
    console.error('Error retrieving posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's posts
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let postsQuery;

    if (isAdmin) {
      // Admin: Get all posts of the specified user
      postsQuery = Post.find({ user_id: userId });
    } else {
      // Current User: Check if the current user is a friend of the user whose posts are being requested
      const currentUser = await User.findById(currentUserId)
        .select('friends')
        .exec();

      const isFriend = currentUser?.friends.some((friendId) =>
        friendId.equals(userId),
      );

      if (isFriend) {
        // If they are friends, return all posts
        postsQuery = Post.find({ user_id: userId });
      } else {
        // If not friends, return only "Public" posts
        postsQuery = Post.find({ user_id: userId, visibility: 'Public' });
      }
    }

    // Execute the query and process the results
    const posts = await postsQuery
      .sort({ createdAt: -1 })
      .select(
        '_id user_id group_id content images visibility reactions comments createdAt',
      )
      .populate({
        path: 'user_id',
        select: '_id username displayName profileImage contentType',
      })
      .populate({
        path: 'comments.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'reactions.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'comments.reactions.author_id', // Populates the author of each reaction in comments
        select: '_id username displayName profileImage',
      })
      .exec();

    // Process virtual images to be included in the response
    const processedPosts = posts.map((post) => {
      const user = post.user_id as any;

      // Manually create the virtualProfileImage
      const virtualProfileImage =
        user.profileImage && user.profileImage.data
          ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
          : null;

      return {
        _id: post._id,
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          virtualProfileImage,
        },
        group_id: post.group_id,
        content: post.content,
        // @ts-ignore
        images: post.virtualImages,
        visibility: post.visibility,
        reactions: post.reactions,
        comments: post.comments,
        createdAt: post.createdAt,
      };
    });

    return res.status(200).json(processedPosts);
  } catch (error) {
    console.error("Error retrieving user's posts:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get group's posts
export const getGroupPosts = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;
    const currentUserId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the group ID format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    let postsQuery;

    if (isAdmin) {
      // Admin: Get all posts of the specified group
      postsQuery = Post.find({ group_id: groupId });
    } else {
      if (group.visibility === 'Private') {
        // Current User: If the group is private, check if the user is a member
        const isMember = group.members.some((memberId) =>
          memberId.equals(currentUserId),
        );

        if (!isMember) {
          return res.status(403).json({
            message: 'You are not authorized to view posts in this group',
          });
        }
      }
      // Get all posts of the specified group (for public groups or if the user is a member of the private group)
      postsQuery = Post.find({ group_id: groupId });
    }

    // Execute the query and sort by createdAt in descending order
    const posts = await postsQuery
      .sort({ createdAt: -1 }) // Order by createdAt desc
      .select(
        '_id user_id group_id content images visibility reactions comments createdAt',
      )
      .populate({
        path: 'user_id',
        select: '_id username displayName profileImage contentType',
      })
      .populate({
        path: 'comments.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'reactions.author_id', // Populates the author of each comment
        select: '_id username displayName profileImage',
      })
      .populate({
        path: 'comments.reactions.author_id', // Populates the author of each reaction in comments
        select: '_id username displayName profileImage',
      })
      .exec();

    // Process virtual images to be included in the response
    const processedPosts = posts.map((post) => {
      const user = post.user_id as any;

      // Manually create the virtualProfileImage
      const virtualProfileImage =
        user.profileImage && user.profileImage.data
          ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
          : null;

      return {
        _id: post._id,
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          virtualProfileImage,
        },
        group_id: post.group_id,
        content: post.content,
        // @ts-ignore
        images: post.virtualImages,
        visibility: post.visibility,
        reactions: post.reactions,
        comments: post.comments,
        createdAt: post.createdAt,
      };
    });

    return res.status(200).json(processedPosts);
  } catch (error) {
    console.error('Error retrieving group posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId)
      .select(
        '_id user_id group_id content images visibility reactions comments createdAt',
      )
      .populate({
        path: 'user_id',
        select: '_id username displayName profileImage contentType',
      })
      .exec();

    // If the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Manually handle virtualProfileImage
    const user = post.user_id as any;

    const virtualProfileImage =
      user.profileImage && user.profileImage.data
        ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
        : null;

    // Prepare the response data, including virtual images and user info
    const response = {
      _id: post._id,
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        virtualProfileImage,
      },
      group_id: post.group_id,
      content: post.content,
      // @ts-ignore
      images: post.virtualImages,
      visibility: post.visibility,
      reactions: post.reactions,
      comments: post.comments,
      createdAt: post.createdAt,
    };

    // Return the post data
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving the post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a post's history by ID
export const getPostHistoryById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Retrieve the edit history
    const editHistory = post.editHistory;

    // Initialize an array to hold the processed history
    const processedHistory = [];

    // Iterate through the edit history in reverse order to fill in missing values
    let lastContent = post.content;
    let lastImages = post.images.map(
      (img) => `data:${img.contentType};base64,${img.data!.toString('base64')}`,
    );
    let lastVisibility = post.visibility;

    for (let i = editHistory.length - 1; i >= 0; i--) {
      const historyEntry = editHistory[i];

      // Fill in missing values with the last known value
      const content = historyEntry.content || lastContent;
      const images =
        historyEntry.images.length > 0
          ? historyEntry.images.map(
            (img) =>
              `data:${img.contentType};base64,${img.data!.toString('base64')}`,
          )
          : lastImages;
      const visibility = historyEntry.visibility || lastVisibility;

      // Update last known values
      lastContent = content;
      lastImages = images;
      lastVisibility = visibility;

      // Push the processed history entry
      // @ts-ignore
      processedHistory.unshift({
        content,
        images,
        visibility,
        createdAt: historyEntry.createdAt,
      });
    }

    // Return the processed history
    return res.status(200).json(processedHistory);
  } catch (error) {
    console.error('Error retrieving post history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { group_id, content, visibility } = req.body;
    const files = req.files as Express.Multer.File[];
    // Validate required fields
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Validate group_id if provided
    let groupId = null;
    if (group_id) {
      if (!mongoose.Types.ObjectId.isValid(group_id)) {
        return res.status(400).json({ message: 'Invalid group ID' });
      }
      // @ts-ignore
      groupId = new mongoose.Types.ObjectId(group_id);
    }

    // If group_id is provided, set visibility to "Public"
    const postVisibility = groupId ? 'Public' : visibility;

    // Handle images
    const images = files?.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    // Create the new post
    const newPost = new Post({
      user_id: userId,
      group_id: groupId,
      content,
      images,
      visibility: postVisibility,
      createdAt: new Date(),
      editHistory: [],
    });

    await newPost.save();

    // Find the user who created the post
    const user = await User.findById(userId)
      .select('displayName friends')
      .exec();

    if (groupId) {
      // Notify all group members
      const group = await Group.findById(groupId).select('members name').exec();

      if (group) {
        const notificationMessage = `New post in ${group.name} created by ${user!.displayName}.`;

        // Send notification to all group members
        await User.updateMany(
          { _id: { $in: group.members } },
          {
            $push: {
              notifications: {
                type: 'Post',
                message: notificationMessage,
                isRead: false,
                createdAt: new Date(),
              },
            },
          },
        );
      }
    } else {
      // Notify all user's friends
      const notificationMessage = `${user!.displayName} has created a new post.`;

      // Send notification to all friends
      await User.updateMany(
        { _id: { $in: user!.friends } },
        {
          $push: {
            notifications: {
              type: 'Post',
              message: notificationMessage,
              isRead: false,
              createdAt: new Date(),
            },
          },
        },
      );
    }

    // Return the newly created post
    return res.status(201).json('Post created successfully');
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a post
export const editPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId; // Assume user ID is stored in session
    const { content, visibility } = req.body;
    const files = req.files; // Ensure files is treated as an array of multer files

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the current user is the owner of the post
    if (post.user_id != userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this post' });
    }

    // Prepare the edit history record
    const editHistoryRecord: any = {
      content: post.content,
      images: [...post.images], // Copy the existing images safely
      visibility: post.visibility,
      createdAt: new Date(),
    };

    // Update the post's content, images, and visibility
    if (content) {
      post.content = content;
    } else {
      delete editHistoryRecord.content;
    }

    if (Array.isArray(files) && files.length > 0) {
      // Clear existing images safely
      post.set('images', []);
      files.forEach((file) => {
        post.images.push({
          data: file.buffer,
          contentType: file.mimetype,
        });
      });
    } else {
      delete editHistoryRecord.images;
    }

    if (visibility) {
      post.visibility = visibility;
    } else {
      delete editHistoryRecord.visibility;
    }

    // Add the edit history record if any of the fields were updated
    if (Object.keys(editHistoryRecord).length > 1) {
      post.editHistory.push(editHistoryRecord);
    }

    // Save the updated post
    await post.save();

    // Return the updated post
    return res.status(200).json({ message: 'Post edited successfully' });
  } catch (error) {
    console.error('Error editing post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the current user is the owner of the post or an admin
    if (post.user_id != userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this post' });
    }

    // Delete the post
    await Post.deleteOne({ _id: postId });

    // Return success response
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a comment to a post
export const addCommentToPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const author_id = req.session.userId;
    const { content } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the author ID format
    if (!author_id || !mongoose.Types.ObjectId.isValid(author_id)) {
      return res.status(400).json({ message: 'Invalid author ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create the new comment
    const newComment = {
      author_id: new mongoose.Types.ObjectId(author_id),
      content,
      reactions: [],
      createdAt: new Date(),
      editHistory: [],
    };

    // Add the new comment to the post's comments array
    post.comments.push(newComment);

    // Save the updated post
    const savedPost = await post.save();

    // Notify the post author
    if (post.user_id != author_id) {
      // Ensure the user is not notifying themselves
      // Find the comment author to get the displayName
      const commentAuthor =
        await User.findById(author_id).select('displayName');
      if (commentAuthor) {
        const postAuthor = await User.findById(post.user_id);
        if (postAuthor) {
          const notificationMessage = `${commentAuthor.displayName} commented on your post.`;
          postAuthor.notifications.push({
            type: 'Comment',
            message: notificationMessage,
            isRead: false,
            createdAt: new Date(),
          });
          await postAuthor.save();
        }
      }
    }

    // Find the newly added comment (last one in the array) and populate its author_id
    const newlyAddedComment = savedPost.comments[savedPost.comments.length - 1];

    // Populate the `author_id` in the newly added comment
    const populatedComment = await Post.populate(newlyAddedComment, {
      path: 'author_id',
      select: '_id username displayName profileImage',
    });

    // Return success response
    return res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a comment on a post
export const editCommentOnPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const userId = req.session.userId;
    const { content } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by comment_id
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the current user is the author of the comment
    if (comment.author_id != userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this comment' });
    }

    // Add the current comment content to the edit history before editing
    comment.editHistory.push({
      content: comment.content,
      createdAt: new Date(),
    });

    // Update the comment's content
    comment.content = content;

    // Save the updated post
    await post.save();

    // Return success response with the updated comment
    return res.status(200).json({ message: 'Comment edited successfully' });
  } catch (error) {
    console.error('Error editing comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a comment from a post
export const deleteCommentFromPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by comment_id
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the current user is the author of the comment, the owner of the post, or an admin
    if (comment.author_id != userId && post.user_id != userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this comment' });
    }

    // Remove the comment from the post's comments array using pull
    post.comments.pull(commentId);

    // Save the updated post
    await post.save();

    // Return success response with the updated post's comments
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a reaction to a post
export const addReactionToPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId;
    const { type } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the reaction type
    const validReactions = ['Like', 'Love', 'Haha', 'Angry'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already reacted
    const existingReaction = post.reactions.find(
      (reaction) => reaction.author_id == userId,
    );

    if (existingReaction) {
      // If the user has already reacted, update the reaction type
      existingReaction.type = type;
    } else {
      // Otherwise, create a new reaction
      const newReaction = {
        author_id: new mongoose.Types.ObjectId(userId),
        type,
      };

      // Add the new reaction to the post's reactions array
      post.reactions.push(newReaction);
    }

    // Save the updated post
    await post.save();

    // Notify the post owner
    if (post.user_id != userId) {
      // Find the user who reacted to get the displayName
      const reactingUser = await User.findById(userId).select('displayName');
      if (reactingUser) {
        const postAuthor = await User.findById(post.user_id);
        if (postAuthor) {
          const notificationMessage = `${reactingUser.displayName} reacted to your post.`;
          postAuthor.notifications.push({
            type: 'Reaction',
            message: notificationMessage,
            isRead: false,
            createdAt: new Date(),
          });
          await postAuthor.save();
        }
      }
    }

    // Return success response with the updated reactions
    return res.status(201).json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a reaction on a post
export const editReactionOnPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId!;
    const { type } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the reaction type
    const validReactions = ['Like', 'Love', 'Haha', 'Angry'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the reaction by userId
    const reaction = post.reactions.find(
      (reaction) => reaction.author_id.toString() === userId.toString(),
    );
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Check if the current user is the author of the reaction
    if (reaction.author_id != userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this reaction' });
    }

    // Update the reaction's type
    reaction.type = type;

    // Save the updated post
    await post.save();

    // Return success response with the updated reaction
    return res
      .status(200)
      .json({ message: 'Reaction edited successfully', reaction });
  } catch (error) {
    console.error('Error editing reaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a reaction from a post
export const deleteReactionFromPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the reaction by userId
    const reaction = post.reactions.find(
      (reaction) => reaction.author_id.toString() === userId!.toString(),
    );

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Check if the current user is the author of the reaction or an admin
    if (reaction.author_id != userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this reaction' });
    }

    // Remove the reaction from the post's reactions array using pull
    post.reactions.pull(reaction._id);

    // Save the updated post
    await post.save();

    // Return success response
    return res.status(200).json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a reaction to a comment
export const addReactionToComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const userId = req.session.userId;
    const { type } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    // Validate the reaction type
    const validReactions = ['Like', 'Love', 'Haha', 'Angry'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by comment_id
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user has already reacted to the comment
    const existingReaction = comment.reactions.find(
      (reaction) => reaction.author_id == userId,
    );

    if (existingReaction) {
      // If the user has already reacted, update the reaction type
      existingReaction.type = type;
    } else {
      // Otherwise, create a new reaction
      const newReaction = {
        author_id: new mongoose.Types.ObjectId(userId),
        type,
      };

      // Add the new reaction to the comment's reactions array
      comment.reactions.push(newReaction);
    }

    // Save the updated post
    await post.save();

    // Find the reacting user's details for the notification
    const reactingUser = await User.findById(userId).select('displayName');

    // Send notification to the comment author
    if (comment.author_id != userId) {
      const commentAuthor = await User.findById(comment.author_id);
      if (commentAuthor) {
        commentAuthor.notifications.push({
          type: 'Reaction',
          message: `${reactingUser?.displayName} reacted to your comment.`,
          isRead: false,
          createdAt: new Date(),
        });
        await commentAuthor.save();
      }
    }

    // Return success response with the updated comment's reactions
    return res.status(201).json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction to comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a reaction on a comment
export const editReactionOnComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const reactionId = req.params.reaction_id;
    const userId = req.session.userId;
    const { type } = req.body;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    // Validate the reaction ID format
    if (!mongoose.Types.ObjectId.isValid(reactionId)) {
      return res.status(400).json({ message: 'Invalid reaction ID' });
    }

    // Validate the reaction type
    const validReactions = ['Like', 'Love', 'Haha', 'Angry'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by comment_id
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the reaction by reaction_id within the comment's reactions array
    const reaction = comment.reactions.id(reactionId);
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Check if the current user is the author of the reaction
    if (reaction.author_id != userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this reaction' });
    }

    // Update the reaction's type
    reaction.type = type;

    // Save the updated post
    await post.save();

    // Return success response with the updated reaction
    return res.status(200).json({ message: 'Reaction edited successfully' });
  } catch (error) {
    console.error('Error editing reaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a reaction from a comment
export const deleteReactionFromComment = async (
  req: Request,
  res: Response,
) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const reactionId = req.params.reaction_id;
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;

    // Validate the post ID format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate the comment ID format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the comment by comment_id
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the reaction by userId
    const reaction = comment.reactions.find(
      (reaction) => reaction.author_id.toString() === userId!.toString(),
    );

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Check if the current user is the author of the reaction or an admin
    if (reaction.author_id != userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this reaction' });
    }

    // Remove the reaction from the comment's reactions array using pull
    comment.reactions.pull(reaction._id);

    // Save the updated post
    await post.save();

    // Return success response
    return res.status(200).json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
