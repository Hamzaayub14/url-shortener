import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Response } from 'express';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async create(@Body('originalUrl') originalUrl: string) {
    const url = await this.urlService.create(originalUrl);
    return { originalUrl: url.originalUrl, shortCode: url.shortCode };
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    try {
      const url = await this.urlService.findOneByShortCode(shortCode);
      return res.redirect(url.originalUrl);
    } catch (error) {
      throw new NotFoundException('Short URL not found');
    }
  }
}
