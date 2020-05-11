import mongoose, { Schema, Document } from 'mongoose';
import IUser from './user.interface';

const User: Schema = new Schema({
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, minlength: 6, maxlength: 200, unique: true },
    password: { type: String, required: true, minlength : 6 },
    savedAds: { type: Array, required: true },
    listOfAction: { type: Array, required: true },
    date: { type: Date, default: Date.now() },
});

export default mongoose.model<IUser>('User', User);