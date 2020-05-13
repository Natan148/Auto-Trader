import Joi from '@hapi/joi';

// cr-evgeni: Use type 'any' only when you really dont know which type the function gets, this is all the concept of typescript.
// In this func for example you can create an interface of user that has all the fields and pass it to this func, it more generic.
export const registerValidation = (data: any) => {
    return  Joi.object().keys({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(6).max(100).required().email(),
        password: Joi.string().min(6).required(),
    }).validate(data)
}
// cr-evgeni: why do you have a function for login validation and then you have two seperate functions for validating
// password and user name, think how to improve it . 
export const loginValidation = (data: any) => {
    return  Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }).validate(data)
}

export const passwordValidation = (data: any) => {
    return  Joi.object().keys({
        password: Joi.string().min(6).max(50).required(),
    }).validate(data)
}

export const usernameValidation = (data: any) => {
    return  Joi.object().keys({
        username: Joi.string().min(3).max(50).required()
    }).validate(data)
}