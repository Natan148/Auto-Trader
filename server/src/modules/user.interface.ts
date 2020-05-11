import mongoose from 'mongoose';
import { ACTIONS_TYPES } from '../enums';

interface IUser extends mongoose.Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    savedAds: [string];
    listOfAction: [{actionType: ACTIONS_TYPES, date: Date}];
    date: Date;
}

export default IUser;