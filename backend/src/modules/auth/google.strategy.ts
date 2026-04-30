import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { _config } from '../../config/config.js';
import { logger } from '../../utils/logger.js';

export const initGoogleStrategy = () => {
  if (!_config.GOOGLE_CLIENT_ID || !_config.GOOGLE_CLIENT_SECRET) {
    logger.warn('Google OAuth credentials missing. Google login will not work.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: _config.GOOGLE_CLIENT_ID!,
        clientSecret: _config.GOOGLE_CLIENT_SECRET!,
        callbackURL: _config.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const { id, displayName, emails, photos } = profile;
          const email = emails?.[0]?.value;
          const avatar = photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), false);
          }

          // Just return the profile data. AuthService will handle find/create logic.
          const googleUser = {
            id,
            name: displayName,
            email,
            avatar,
          };

          return done(null, googleUser as any);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
};
