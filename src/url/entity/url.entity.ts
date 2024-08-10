import { UrlAnalytics } from 'src/analytics/entity/analytics.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UrlAnalytics, (analytics) => analytics.url)
  analytics: UrlAnalytics[];
}
