import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, require: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
