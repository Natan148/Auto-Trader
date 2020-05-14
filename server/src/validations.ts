import Joi from '@hapi/joi';
import { RegisterValidation } from './validations.interface';

export const registerValidation = (data: RegisterValidation) => {
    return Joi.object().keys({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(6).max(100).required().email(),
        password: Joi.string().min(6).required(),
    }).validate(data);
}

// TODO delete this function
export const loginValidation = (data: any) => {
    return Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }).validate(data);
}

export const passwordValidation = (data: string) => {
    return Joi.object().keys({
        password: Joi.string().min(6).max(50).required(),
    }).validate({ password: data });
}

export const emailValidation = (data: string) => {
    return  Joi.object().keys({
        username: Joi.string().min(3).max(50).required()
    }).validate({ email: data });
}