import { Controller, Post, Body, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('url')
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  async create(@Body('originalUrl') originalUrl: string) {
    const url = await this.urlService.create(originalUrl);
    return { originalUrl: url.originalUrl, shortCode: url.shortCode };
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    try {
      const url = await this.urlService.findOneByShortCode(shortCode);
      await this.urlService.logVisit(shortCode, 'referrer-example', 'ip-address-example', 'user-agent-example', 'device-type-example', 'location-example');
      return res.redirect(url.originalUrl);
    } catch (error) {
      throw new NotFoundException('Short URL not found');
    }
  }
}
