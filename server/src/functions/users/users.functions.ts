import moment from 'moment';
import bcrypt from 'bcryptjs';
import { ACTIONS_TYPES } from '../../properties';
import IWhitelist from '../../modules/whitelist.module';
import IUser from '../../modules/user.module';
import { passwordValidation } from '../../validations';


export const insertTokenToWhitelist = (token: string): Promise<void> => {
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

export const userAuthentication = 
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

export const updateActionsList = async (id: string, actionType: ACTIONS_TYPES): Promise<void> => {
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

export const isEmailExists = (email: string): Promise<boolean> => {
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

export const setFailedLoginCounter = (email: string, reset: boolean): void => {
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

export const hashPass = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export const checkBeforeChangePass = (password: string, newPassword: string): Promise<void> => {
  console.log(`Check before change passwords ==> ${moment().format()}`);
  return new Promise<void>
  ((resolve: () => void, reject: (err: {status: number, msg: string}) => void) => {
      if (!password || !newPassword) {
          console.log(`Password or newPassword is missing ==> ${moment().format()}`);
          return reject({ status: 400, msg: 'Password or newPassword is missing' });
      }
      if (password === newPassword) {
          console.log(`The both of the passwords are equal ==> ${moment().format()}`);
          return reject({ status: 400, msg: 'The both of the passwords are equal'});
      }
      const { error } = passwordValidation(newPassword);
      if (error) {
          console.log(`The newPassword ${newPassword} is invalid`);
          return reject({ status: 400, msg: error.details[0].message});
      }
      console.log(`The checking passed successfully ==> ${moment().format()}`);
      resolve();
  })
}