import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { _config } from '../../config/config.js';
import { IJwtPayload } from './auth.interface.js';
import { UserService } from '../user/user.service.js';
import { UserRepository } from '../user/user.repository.js';
import { Request } from 'express';


const  userRepository = new UserRepository();
const userService = new UserService(userRepository);

// cookie extractor
const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

export const initJwtStrategy = () => {
  const options = {
    jwtFromRequest:cookieExtractor,
    secretOrKey: _config.JWT_SECRET!,
  };

  passport.use(
    new JwtStrategy(options, async (payload: IJwtPayload, done) => {
      try {
        const user = await userService.findById(payload.sub);

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
