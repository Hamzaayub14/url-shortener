import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PassportConfig {
  private readonly logger = new Logger(PassportConfig.name);

  constructor(private readonly userService: UsersService) {}

  configure(passport: PassportStatic) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done,
        ) => {
          try {
            const user = await this.userService.findOrCreateUser(profile);
            done(null, user);
          } catch (error) {
            this.logger.error(
              'Error during Google authentication',
              error.stack,
            );
            done(error, null);
          }
        },
      ),
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await this.userService.findById(id);
        done(null, user);
      } catch (error) {
        this.logger.error('Error deserializing user', error.stack);
        done(error, null);
      }
    });
  }
}
