import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../url/entity/url.entity';
import { UrlAnalytics } from './entity/analytics.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(UrlAnalytics)
    private readonly analyticsRepository: Repository<UrlAnalytics>,
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async getAnalytics(shortCode: string, date?: string): Promise<UrlAnalytics[]> {
    try {
      const url = await this.urlRepository.findOne({ where: { shortCode } });

      if (!url) {
        this.logger.warn(`URL not found for short code: ${shortCode}`);
        throw new NotFoundException(`URL not found for short code: ${shortCode}`);
      }

      const query = this.analyticsRepository
        .createQueryBuilder('analytics')
        .where('analytics.urlId = :urlId', { urlId: url.id });

      if (date) {
        query.andWhere('DATE(analytics.timestamp) = :date', { date });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error(`Error retrieving analytics for short code: ${shortCode}`, error.stack);
      throw new Error('Failed to retrieve analytics data');
    }
  }

  async logVisit(
    url: Url,
    referrer: string,
    ipAddress: string,
    userAgent: string,
    deviceType: string,
    location: string,
  ): Promise<void> {
    try {
      const analytics = new UrlAnalytics();
      analytics.url = url;
      analytics.timestamp = new Date();
      analytics.referrer = referrer;
      analytics.ipAddress = ipAddress;
      analytics.userAgent = userAgent;
      analytics.deviceType = deviceType;
      analytics.location = location;

      await this.analyticsRepository.save(analytics);

      this.logger.log(`Analytics logged for URL with short code: ${url.shortCode}`);
    } catch (error) {
      this.logger.error(`Error logging visit for URL with short code: ${url.shortCode}`, error.stack);
      throw new Error('Failed to log visit data');
    }
  }
}
