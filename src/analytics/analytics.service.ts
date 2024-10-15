import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../url/entity/url.entity';
import { UrlAnalytics } from './entity/analytics.entity';
import axios from 'axios';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(UrlAnalytics)
    private readonly analyticsRepository: Repository<UrlAnalytics>,
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async getAnalytics(
    shortCode: string,
    date?: string,
  ): Promise<UrlAnalytics[]> {
    try {
      const url = await this.urlRepository.findOne({ where: { shortCode } });

      if (!url) {
        this.logger.warn(`URL not found for short code: ${shortCode}`);
        throw new NotFoundException(
          `URL not found for short code: ${shortCode}`,
        );
      }

      const query = this.analyticsRepository
        .createQueryBuilder('analytics')
        .where('analytics.urlId = :urlId', { urlId: url.id });

      if (date) {
        query.andWhere('DATE(analytics.timestamp) = :date', { date });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error(
        `Error retrieving analytics for short code: ${shortCode}`,
        error.stack,
      );
      throw new Error('Failed to retrieve analytics data');
    }
  }

  async logVisit(
    shortCode: string,
    referrer: string,
    ipAddress: string,
    userAgent: string,
    deviceType: string,
  ): Promise<void> {
    try {
      const url = await this.urlRepository.findOne({ where: { shortCode } });
      if (!url) {
        this.logger.warn(`URL not found for short code: ${shortCode}`);
        throw new NotFoundException('Short URL not found');
      }

      const location = await this.determineLocation(ipAddress);

      const analytics = new UrlAnalytics();
      analytics.url = url;
      analytics.timestamp = new Date();
      analytics.referrer = referrer;
      analytics.ipAddress = ipAddress;
      analytics.userAgent = userAgent;
      analytics.deviceType = deviceType;
      analytics.location = location;

      await this.analyticsRepository.save(analytics);
      this.logger.log(`Analytics logged for URL with short code: ${shortCode}`);
    } catch (error) {
      this.logger.error(
        `Error logging visit for URL with short code: ${shortCode}`,
        error.stack,
      );
      throw new Error('Failed to log visit data');
    }
  }

  private async determineLocation(ipAddress: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.ipstack.com/${ipAddress}?access_key=${process.env.IPSTACK_ACCESS_KEY}`,
      );
      console.log('response data', response);
      const { city, region_name, country_name } = response.data;
      return `${city || 'Unknown'}, ${region_name || 'Unknown'}, ${country_name || 'Unknown'}`;
    } catch (error) {
      this.logger.error(
        `Error fetching location for IP: ${ipAddress}`,
        error.stack,
      );
      return 'Unknown, Unknown, Unknown';
    }
  }
}
