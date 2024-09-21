import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user/user';
import { UrlModule } from './url/url.module';
import { Url } from './url/entity/url.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { UrlAnalytics } from './analytics/entity/analytics.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ session: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: +configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Url, UrlAnalytics],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    UrlModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(private readonly passportConfig: PassportConfig) {}

  configure(consumer: MiddlewareConsumer) {
    this.passportConfig.configure(consumer);
  }
}
export class AppModule {}
