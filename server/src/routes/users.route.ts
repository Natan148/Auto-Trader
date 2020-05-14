import { Router, Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import IUser from '../modules/user.module';
import IWhitelist from '../modules/whitelist.module';
import { registerValidation, loginValidation, passwordValidation } from '../validations';
import { ACTIONS_TYPES, SECRET_KEY } from '../properties';
import { verifyToken } from '../verifyToken';
import { resolve } from 'dns';
import { rejects } from 'assert';



const router = Router();

// TODO update white list date on user activity

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
// cr-evgeni: this function is really long , think how to seperate it to smaller functions.
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

    // cr-evgeni: move this two lines to a function in utils dir, for future use. 
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
        const token = jwt.sign(savedUser._id.toString(), SECRET_KEY);
        insertTokenToWhitelist(token)
        .then(() => {
            res.header('auth-token', token).send(token);
            console.log(`The new account was registered successfully ==> ${moment().format()}`);
        })
        .catch(err => res.status(err.status).send(err.msg));
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
                const token = jwt.sign(user._id.toString(), SECRET_KEY);
                try {
                    insertTokenToWhitelist(token)
                    .then(() => {
                        res.header('auth-token', token).send(token);
                        updateActionsList(user._id, ACTIONS_TYPES.LOGIN);
                    })
                    .catch(err => res.status(err.status).send(err.msg));
                } catch(err) {return console.log(`There was an error: ${err.message}
                ==> ${moment().format()}`)};   
            }
        })
   })
   .catch(err => { 
       err.status === 400 && setFailedLoginCounter(req.body.email, false);
       return res.status(err.status).send(err.msg) });
}) 
// cr-evgeni: you have here a middleware of verify token , then why you do it again in this function ?
// you do it almost in all routes. 
router.delete('/del', verifyToken, async (req: Request, res: Response) => {
    const token = req.header('auth-token');
    if (token) {
        const id = jwt.verify(token, SECRET_KEY);
        console.log(`Try to delete user with id: ${id} ==> ${moment().format()}`);
        const password = req.body.password;
        if (!password) {
            console.log(`There is no password ==> ${moment().format()}`);
            return res.status(400).send('Password is missing');
        }
        try {
            const user = await IUser.findById({ _id: id });
            user && userAuthentication(user.email, password)
            .then(async () => {
                await user.remove();
                console.log(`User deleted successfully ==> ${moment().format()}`);
                res.sendStatus(200);
            })
            .catch(err => { return res.status(err.status).send(err.msg) });
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

router.post('/logout', verifyToken, async (req: Request, res: Response) => {
    const token = req.get('auth-token');
    if (token) {
        const id = jwt.verify(token, SECRET_KEY);
        console.log(`User with id ${id} logging out ==> ${moment().format()}`);
        await IWhitelist.deleteOne({ token });
        updateActionsList(id.toString(), ACTIONS_TYPES.LOGOUT)
        .then(() => {return res.sendStatus(200)})
        .catch(err => {return res.status(err.status).send(err.msg)});
    }
})
// cr-evgeni: think how seperate to smaller functions and orginze in seperate files. . 
router.put('/changePass', verifyToken, async (req: Request, res: Response) => {
    const token = req.get('auth-token');
    if (token) {
        const id = jwt.verify(token, SECRET_KEY);
        console.log(`Try to change password with id ${id} ==> ${moment().format()}`);
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        if (!password || !newPassword) {
            console.log(`Password or newPassword is missing ==> ${moment().format()}`);
            return res.status(400).send('Password or newPassword is missing');
        }
        if (password === newPassword) {
            console.log(`The both of the passwords are equal ==> ${moment().format()}`);
            return res.status(400).send('The both of the passwords are equal');
        }
        try {
            const user = await IUser.findById(id);
            user && userAuthentication(user.email, password)
            .then(async () => {
                const { error } = passwordValidation(newPassword);
                if (error) {
                    console.log(`The newPassword ${newPassword} is invalid`);
                    return res.status(400).send(error.details[0].message);
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(newPassword, salt);
                await user.updateOne({ password: hashedPass });
                console.log(`The password was updated to ${newPassword} successfully 
                ==> ${moment().format()}`);
                res.sendStatus(200);
            })
            .catch(err => { return res.status(err.status).send(err.msg) });
        } catch(err) {
            console.log(`There was an error during changePass - ${err.message}`);
            res.status(500).send(err.message);
        }
    }
})
// cr-evgeni: this file should contains only routes, think how move functions to seperate files. 


const insertTokenToWhitelist = (token: string): Promise<void> => {
    return new Promise<void>
    ((resolve: () => void, reject: (err: {status: number, msg: string}) => void) => {
        const query = { token },
            update = { token },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };
            
        IWhitelist.findOneAndUpdate(query, update, options, error => {
            if (error) {
                console.log(`There was an error during \"insertTokenToWhitelist\" - ${error.message}
                ==> ${moment().format()}`);
                return reject({ status: 500, msg: error.message});
            };
            console.log(`The token ${token} was inserted into the whitelist
            ==> ${moment().format()}`);
            resolve();
        });
    })
} 

const userAuthentication = 
(email: string, password: string): Promise<void> => {
    console.log(`Check authentication for email ${email} and pass ${password}
    ==> ${moment().format()}`);
    return new Promise<void>
    ((resolve: () => void, reject: (err: { status: number, msg: string }) => void) => {
        IUser.findOne({ email }, (err, user) => {
            // TODO check if there is also an email in this authentication
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

const updateActionsList = async (id: string, actionType: ACTIONS_TYPES): Promise<void> => {
    console.log(`Update action ${actionType} list for id ${id} ==> ${moment().format()}`);
    return new Promise<void>
    ((resolve: () => void, reject: (err: {status: number, msg: string}) => void) => {
        const newAction = { actionType: actionType, date: moment().format() };
        IUser.updateOne({ _id: id }, { $push: { listOfAction: newAction } }, err => {
            if (err) {
                console.error(`There was an error during \"updateActionsList\" - ${err.message}
                ==> ${moment().format()}`);
                return reject({ status: 500, msg: err.message });
            }
            resolve();
        })
    })
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

//cr-evgeni: conclude:
// *seperate to smaller functions , each function needs to be 5-6 lines, not more . 
// *think how move functions to seperate files, like you did with "users.route.ts", this file should
// contain only user-related functions.
// always think which types you use , if needed create interfaces .  
