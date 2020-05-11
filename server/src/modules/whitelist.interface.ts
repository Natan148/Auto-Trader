import mongoose from 'mongoose';

interface IWhitelist extends mongoose.Document {
  token: string;
  lastActivity: Date;
}

export default IWhitelist;