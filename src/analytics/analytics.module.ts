import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlAnalytics } from './entity/analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Url } from '../url/entity/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrlAnalytics, Url])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],  // Export the service if needed by other modules
})
export class AnalyticsModule {}
