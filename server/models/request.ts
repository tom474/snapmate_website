import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Accepted', 'Rejected'],
    },
  },
  { timestamps: true },
);

const groupRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Accepted', 'Rejected'],
    },
  },
  { timestamps: true },
);

const groupCreationRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      visibility: { type: String, required: true, enum: ['Public', 'Private'] },
      groupImage: {
        data: { type: Buffer },
        contentType: { type: String },
      },
      coverImage: {
        data: { type: Buffer },
        contentType: { type: String },
      },
      admins: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      ],
      members: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      ],
      posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Accepted', 'Rejected'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

groupCreationRequestSchema.virtual('virtualGroupImage').get(function () {
  if (
    this.group &&
    this.group.groupImage != null &&
    this.group.groupImage.contentType != null &&
    this.group.groupImage.data != null
  ) {
    return `data:${this.group.groupImage.contentType};base64,${this.group.groupImage.data.toString('base64')}`;
  }
  return undefined;
});

groupCreationRequestSchema.virtual('virtualCoverImage').get(function () {
  if (
    this.group &&
    this.group.coverImage != null &&
    this.group.coverImage.contentType != null &&
    this.group.coverImage.data != null
  ) {
    return `data:${this.group.coverImage.contentType};base64,${this.group.coverImage.data.toString('base64')}`;
  }
  return undefined;
});

export const FriendRequest = mongoose.model(
  'FriendRequest',
  friendRequestSchema,
);
export const GroupRequest = mongoose.model('GroupRequest', groupRequestSchema);
export const GroupCreationRequest = mongoose.model(
  'GroupCreationRequest',
  groupCreationRequestSchema,
);
