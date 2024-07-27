import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './entity/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
