import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entity/url.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
  ) {}

  async create(originalUrl: string): Promise<Url> {
    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl },
    });
    if (existingUrl) return existingUrl;

    const { nanoid } = await import('nanoid');
    const shortCode = nanoid(8);
    const newUrl = this.urlRepository.create({ originalUrl, shortCode });
    return this.urlRepository.save(newUrl);
  }

  async findOneByShortCode(shortCode: string): Promise<Url> {
    const url = await this.urlRepository.findOne({ where: { shortCode } });
    if (!url) {
      throw new NotFoundException('Short URL not found');
    }
    return url;
  }
}
