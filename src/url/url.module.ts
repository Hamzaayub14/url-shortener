import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entity/url.entity';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), AnalyticsModule],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
