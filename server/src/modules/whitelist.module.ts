import mongoose, { Schema } from 'mongoose';
import IWhitelist from './whiteList.interface';

const Whitelist: Schema = new Schema({
    token: {type: String, required: true, unique: true},
    date: { type: Date, default: Date.now() },
});

export default mongoose.model<IWhitelist>('Whitelist', Whitelist);