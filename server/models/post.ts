import mongoose, { Schema } from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    group_id: { type: Schema.Types.ObjectId, ref: 'Group' },
    content: { type: String, required: true },
    images: [
      {
        data: { type: Buffer },
        contentType: { type: String },
      },
    ],
    visibility: {
      type: String,
      default: 'Public',
      enum: ['Public', 'Friend'],
    },
    reactions: [
      {
        author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
          type: String,
          required: true,
          enum: ['Like', 'Love', 'Haha', 'Angry'],
        },
      },
    ],
    comments: [
      {
        author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        reactions: [
          {
            author_id: {
              type: Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            type: {
              type: String,
              required: true,
              enum: ['Like', 'Love', 'Haha', 'Angry'],
            },
          },
        ],
        createdAt: { type: Date, default: Date.now },
        editHistory: [
          {
            content: { type: String, required: true },
            createdAt: { type: Date, required: true },
          },
        ],
      },
    ],
    createdAt: { type: Date, default: Date.now },
    editHistory: [
      {
        content: { type: String },
        images: [
          {
            data: { type: Buffer },
            contentType: { type: String },
          },
        ],
        visibility: {
          type: String,
          enum: ['Public', 'Friend'],
        },
        createdAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.virtual('virtualImages').get(function () {
  if (this.images != null && this.images.length > 0) {
    return this.images.map((image) => {
      if (image.contentType != null && image.data != null) {
        return `data:${image.contentType};base64,${image.data.toString('base64')}`;
      }
    });
  }
  return undefined;
});

export const Post = mongoose.model('Post', postSchema);
export default Post;
