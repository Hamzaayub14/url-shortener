import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const url = await this.urlService.findOneByShortCode(shortCode);

      const ipAddress = req.ip || 'Unknown';
      const referrer = req.headers['referer'] || 'Direct';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const deviceType = this.urlService.determineDeviceType(userAgent);

      await this.analyticsService.logVisit(
        shortCode,
        referrer,
        ipAddress,
        userAgent,
        deviceType,
      );

      return res.redirect(url.originalUrl);
    } catch (error) {
      throw new NotFoundException('Short URL not found');
    }
  }
}
