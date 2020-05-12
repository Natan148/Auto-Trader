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

const SECRET_KEY = "nnnaaahdyll";

const router = Router();

// TODO 

// TODO middleware witch allow access to the admin only 
router.get('/', async (req: Request, res: Response) => {
    console.log(`Try to get all users ==> ${moment().format()}`);
    IUser.find({}, (err, doc) => {
        if (err) {
            console.log(`There was an error: ${err.message} ==> ${moment().format()}`);
            return res.status(500).send(err.message);
        }
        console.log(`Get all account successfully ==> ${moment().format()}`);
        res.send(doc);
    })
})

router.post('/register', async (req: Request, res: Response) => {
    console.log(`Try register with `, req.body, ` ==> ${moment().format()}`);
    const { error } = registerValidation(req.body);
    if (error) {
        console.log(`The validation filed: ${error.details[0].message} ==> ${moment().format()}`);
        return res.status(400).send(error.details[0].message);
    }

    isEmailExists(req.body.email)
    .then(result => {
        if (result) {
            return res.status(400).send(`The email ${req.body.email} already exists`)
        }   
    })
    .catch(err => {return res.status(err.status).send(err.msg)});

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const user = new IUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPass,
        savedAds: []
    })

    try {
        const savedUser = await user.save();
        updateActionsList(savedUser._id, ACTIONS_TYPES.REGISTER);
        const token = jwt.sign({_id: savedUser._id}, SECRET_KEY);
        res.header('auth-token', token).send(token);
        console.log(`The new account was registered successfully ==> ${moment().format()}`);
    } catch(err) {
        console.log(`The registration filed:`, err, ` ==> ${moment().format()}`);
        // TODO Check if the error has status code 400 or 500
        res.status(400).send(err);
    }
})

router.post('/login', async (req: Request, res: Response) => {
    console.log(`Try login with email ${req.body.email} and pass ${req.body.password}
     ==> ${moment().format()}`);
     // TODO Check if the user should be locked because of to much failed login.
    const { error } = loginValidation(req.body);
    if (error) {
        console.log(`The validation filed: ${error.details[0].message} ==> ${moment().format()}`);
        return res.status(400).send(error.details[0].message);
    }

   userAuthentication(req.body.email, req.body.password)
   .then(() => {
        console.log(`Logged in ==> ${moment().format()}`);
        setFailedLoginCounter(req.body.email, true);
        IUser.findOne({ email: req.body.email }, async (err, user) => {
            if (err) return res.status(500).send(err.message);
            if (user) {
                const token = jwt.sign({_id: user._id}, SECRET_KEY);
                try {
                    await new IWhitelist({ token }).save()
                    console.log(`The token was inserted to the whitelist ==> ${moment().format()}`);
                    res.header('auth-token', token).send(token);
                    updateActionsList(user._id, ACTIONS_TYPES.LOGIN);
                } catch(err) {return console.log(`There was an error: ${err.message}
                ==> ${moment().format()}`)};   
            }
        })
   })
   .catch(err => { 
       err.status === 400 && setFailedLoginCounter(req.body.email, false);
       return res.status(err.status).send(err.msg) });
}) 

// TODO middleware witch verify the given access token
router.delete('/del', async (req: Request, res: Response) => {
    // TODO cannot get token from header
    const token = req.header('auth-token');
    if (token) {
        const id = jwt.verify(token, SECRET_KEY);
        console.log(`Try to delete user with id: ${id} ==> ${moment().format()}`);
        try {
            await IUser.deleteOne({ _id: id })
            console.log(`User deleted successfully ==> ${moment().format()}`);
            res.sendStatus(200);
        } catch(err) {
            console.log(`There was an error during deleting the user ${id} - ${err.message}
            ==> ${moment().format()}`);
            res.status(500).send(err.message);
        }
    }
})

router.get('/isEmailExists/:email', async (req: Request, res: Response) => {
    isEmailExists(req.params.email)
    .then(result => {
        if (result) {
            res.status(400).send(`The email ${req.params.email} already exists`);
        } else {
            res.sendStatus(200);
        }
    })
    .catch(err => res.status(err.status).send(err));   
})

// TODO middleware witch verify the given access token
router.post('/logout', (req: Request, res: Response) => {
    // TODO cannot get token from header
    const token = req.header('auth-token');
    console.log(token)
    if (token) {
        const id = jwt.verify(token, "nnnaaahdyll");
        console.log(`User with id ${id} logging out ==> ${moment().format()}`);
        IWhitelist.deleteOne({ token });
        updateActionsList(id.toString(), ACTIONS_TYPES.LOGOUT);
        res.sendStatus(200);
    }
})

const userAuthentication = 
(email: string, password: string): Promise<void> => {
    console.log(`Check authentication for email ${email} and pass ${password}
     ==> ${moment().format()}`);
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
                    console.log(`The password ${password} is incorrect ==> ${moment().format()}`);
                    return reject(incorrectPass);
                }
                console.log(`The authentication was succeeded ==> ${moment().format()}`);
                resolve();
            })
        })
    })
}

const updateActionsList = async (id: string, actionType: ACTIONS_TYPES) => {
    console.log(`Update action ${actionType} list for id ${id} ==> ${moment().format()}`);
    const newAction = { actionType: actionType, date: moment().format() };
    await IUser.updateOne({ _id: id }, { $push: { listOfAction: newAction } })
}

const isEmailExists = (email: string): Promise<boolean> => {
    console.log(`Is email ${email} exists ==> ${moment().format()}`);
    return new Promise<boolean>
    ((resolve: (result: boolean) => void,
     reject: (err: { status: number, msg: string }) => void) => {
        IUser.findOne({ email }, (err, user) => {
            if (err) {
                console.log(`There was an error during isEmailExists: ${err.message}
                 ==> ${moment().format()}`);
                return reject({ status: 500, msg: err.message });
            }
            if (user) {
                console.log(`The email ${email} already exists ==> ${moment().format()}`);
                return resolve(true);
            }
            console.log(`The email ${email} does not exists ==> ${moment().format()}`);
            resolve(false);
        })
    })
}

const setFailedLoginCounter = (email: string, reset: boolean): void => {
    isEmailExists(email)
    .then(result => {
        if (result) {
            console.log(`${reset ? 'reset' : 'set'} failed login counter ==> ${moment().format()}`);
            IUser.findOne({ email }, async (err, user) => {
                if (err) return console.log(`There was an error: ${err.message}`);
                await user?.updateOne({ failedLoginCounter: reset ? 0 : +user.failedLoginCounter + 1});
            })
        }
    })
}

export default router;