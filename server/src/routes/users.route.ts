import { Router, Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import IUser from '../modules/user.module';
import IWhitelist from '../modules/whitelist.module';
import { registerValidation, loginValidation } from '../validations';
import { ACTIONS_TYPES } from '../enums';
import { resolve } from 'dns';
import { rejects } from 'assert';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    console.log(`Try register with `, req.body, ` ==> ${moment().format()}`);
    const { error } = registerValidation(req.body);
    if (error) {
        console.log(`The validation filed: ${error.details[0].message} ==> ${moment().format()}`);
        return res.status(400).send(error.details[0].message);
    }

    isEmailExists(req.body.email)
    .catch(err => {return res.status(err.status).send(err.msg)});

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const user = new IUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPass,
        savedAds: [],
        listOfAction: {type: ACTIONS_TYPES.REGISTER, date: Date.now()}
    })

    try {
        const savedUser = await user.save();
        const token = jwt.sign({_id: savedUser._id}, "nnnaaahdyll");
        res.header('auth-token', token).send(token);
        console.log(`The new account registered successfully ==> ${moment().format()}`);
    } catch(err) {
        console.log(`The registration filed:`, err, ` ==> ${moment().format()}`)
        res.status(400).send(err);
    }
})

router.post('/login', async (req: Request, res: Response) => {
    console.log(`Try login with email ${req.body.email} and pass ${req.body.password}
     ==> ${moment().format()}`);
    const { error } = loginValidation(req.body);
    if (error) {
        console.log(`The validation filed: ${error.details[0].message} ==> ${moment().format()}`);
        return res.status(400).send(error.details[0].message);
    }

   userAuthentication(req.body.email, req.body.password)
   .catch(err => { return res.status(err.status).send(err.msg) });
   
   console.log(`Logged in ==> ${moment().format()}`);
   IUser.findOne({ email: req.body.email }, async (err, user) => {
       if (err) return res.status(500).send(err.message);
       if (user) {
           const token = jwt.sign({_id: user._id}, "nnnaaahdyll");
           try {
               await new IWhitelist({ token }).save()
               console.log(`The token was inserted to the whitelist ==> ${moment().format()}`);
           } catch(err) {return console.log(`There was an error: ${err.message}
            ==> ${moment().format()}`)}; 
           
           res.header('auth-token', token).send(token);
       }
   })
}) 

router.get('/isEmailExists/:email', async (req: Request, res: Response) => {
    isEmailExists(req.params.email)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(err.status).send(err));   
})

const userAuthentication = (email: string, password: string): Promise<void> => {
    console.log(`Check authentication for email ${email} and pass ${password} ==> ${moment().format()}`);
    return new Promise<void>
    ((resolve: () => void, reject: (err: { status: number, msg: string }) => void) => {
        IUser.findOne({ email }, (err, user) => {
            const incorrectPass = {status: 400, msg: "The email or password is incorrect"};
            if (err) {
                console.log(`There was an error: ${err.message} ==> ${moment().format()}`);
                return reject({ status: 500, msg: err.message });
            }
            if (!user) {
                console.log(`The email ${email} does not exists ==> ${moment().format()}`);
                return reject(incorrectPass)
            }
            bcrypt.compare(password, user.password)
            .then(correctPass => {
                if (!correctPass) {
                    console.log(`The password is incorrect ==> ${moment().format()}`);
                    return reject(incorrectPass);
                }
                console.log(`The authentication was succeeded ==> ${moment().format()}`);
                resolve();
            })
        })
    })
}

const isEmailExists = (email: string): Promise<boolean> => {
    console.log(`Is email ${email} exists ==> ${moment().format()}`);
    return new Promise<boolean>
    ((resolve: () => void, reject: (err: { status: number, msg: string }) => void) => {
        IUser.findOne({ email }, (err, doc) => {
            if (err) {
                console.log(`There was an error in db: ${err.message} ==> ${moment().format()}`);
                return reject({ status: 500, msg: err.message });
            }
            if (doc) {
                console.log(`The user email ${email} already exists ==> ${moment().format()}`);
                return reject({ status: 400, msg: `The email ${email} already exists` });
            }
            console.log(`The email ${email} does not exists ==> ${moment().format()}`);
            resolve();
        })
    })
}

export default router;