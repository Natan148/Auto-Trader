import Joi from '@hapi/joi';

export const registerValidation = (data: any) => {
    return  Joi.object().keys({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(6).max(100).required().email(),
        password: Joi.string().min(6).required(),
    }).validate(data)
}

export const loginValidation = (data: any) => {
    return  Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }).validate(data)
}

export const passwordValidation = (data: any) => {
    return  Joi.object().keys({
        password: Joi.string().max(50).required(),
    }).validate(data)
}

export const usernameValidation = (data: any) => {
    return  Joi.object().keys({
        username: Joi.string().min(3).max(50).required()
    }).validate(data)
}