import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: 'General',
  },
  designation: {
    type: String,
    default: 'Staff',
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  documents: {
    type: [String],
    default: [],
  },
  profilePicture: {
    type: String,
    default: '',
  },
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
