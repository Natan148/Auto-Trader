import { Router, Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import IUser from '../modules/user.module';
import IWhitelist from '../modules/whitelist.module';
import { registerValidation, loginValidation, passwordValidation } from '../validations';
import {
    insertTokenToWhitelist,
    userAuthentication,
    updateActionsList,
    isEmailExists,
    setFailedLoginCounter,
    hashPass,
    checkBeforeChangePass
} from '../functions/users/users.functions';
import { ACTIONS_TYPES, SECRET_KEY } from '../properties';
import { verifyToken } from '../verifyToken';

const router = Router();

// TODO update white list date on user activity
// TODO function which runs every minute, and check users activity

// TODO middleware which allow access to the admin only 
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
    const user = new IUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: await hashPass(req.body.password),
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
    const id = req.session!.userId;
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
    const id = req.session!.userId;
    console.log(`User with id ${id} logging out ==> ${moment().format()}`);
    await IWhitelist.deleteOne({ token });
    updateActionsList(id.toString(), ACTIONS_TYPES.LOGOUT)
    .then(() => {return res.sendStatus(200)})
    .catch(err => {return res.status(err.status).send(err.msg)});
})
// cr-evgeni: think how seperate to smaller functions and orginze in seperate files. . 
router.put('/changePass', verifyToken, async (req: Request, res: Response) => {
    const id = req.session!.userId;;
    console.log(`Try to change password with id ${id} ==> ${moment().format()}`);
    const { password, newPassword } = req.body;
    checkBeforeChangePass(password, newPassword)
    .then(() => {
        try {
            IUser.findById(id, async (err, user) => {
                if (err) return res.status(500).send(err.message);
                userAuthentication(user!.email, password)
                .then(async () => {
                    await user!.updateOne({ password: await hashPass(newPassword) });
                    console.log(`The password was updated to ${newPassword} successfully 
                    ==> ${moment().format()}`);
                    res.sendStatus(200);
                })
                .catch(err => { return res.status(err.status).send(err.msg) });
            });
        } catch(err) {
            console.log(`There was an error during changePass - ${err.message}`);
            res.status(500).send(err.message);
        }
    })
    .catch(err => res.status(err.status.send(err.msg)));
})

export default router;

//cr-evgeni: conclude:
// *seperate to smaller functions , each function needs to be 5-6 lines, not more . 
// *think how move functions to seperate files, like you did with "users.route.ts", this file should
// contain only user-related functions.
// always think which types you use , if needed create interfaces . 