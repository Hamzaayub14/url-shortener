import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':shortCode')
  async getAnalytics(@Param('shortCode') shortCode: string, @Query('date') date?: string) {
    return this.analyticsService.getAnalytics(shortCode, date);
  }
}
