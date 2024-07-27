import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user/user';
import { Logger } from '@nestjs/common';
import { classToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    try {
      return this.usersRepository.findOne({ where: { username } });
    } catch (error) {
      this.logger.error(
        `Error finding user with username: ${username}`,
        error.stack,
      );
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    try {
      const newUser = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(newUser);
      return classToPlain(savedUser) as User;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new HttpException('User creation failed', HttpStatus.BAD_REQUEST);
    }
  }
}
