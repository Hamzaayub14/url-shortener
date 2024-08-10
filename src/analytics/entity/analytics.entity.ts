import { Url } from 'src/url/entity/url.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class UrlAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Url, (url) => url.analytics)
  url: Url;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  referrer: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  location: string;
}
