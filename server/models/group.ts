import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, require: true },
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
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

groupSchema.virtual('virtualGroupImage').get(function () {
  if (
    this.groupImage != null &&
    this.groupImage.contentType != null &&
    this.groupImage.data != null
  ) {
    return `data:${this.groupImage.contentType};base64,${this.groupImage.data.toString('base64')}`;
  }
  return undefined;
});

groupSchema.virtual('virtualCoverImage').get(function () {
  if (
    this.coverImage != null &&
    this.coverImage.contentType &&
    this.coverImage.data
  ) {
    return `data:${this.coverImage.contentType};base64,${this.coverImage.data.toString('base64')}`;
  }
  return undefined;
});

export const Group = mongoose.model('Group', groupSchema);
export default Group;
