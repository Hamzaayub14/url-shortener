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
  async findOneByEmail(email: string): Promise<User | undefined> {
    try {
      return this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Error finding user with email: ${email}`, error.stack);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
  async createOAuthUser(profile: any): Promise<User> {
    const newUser = this.usersRepository.create({
      username: profile.displayName,
      email: profile.emails[0].value,
      password: '',
    });
    return this.usersRepository.save(newUser);
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

  async findOrCreateUser(createUserDto: CreateUserDto) {
    try {
      let user: any = await this.findOne(createUserDto.username);

      if (user) {
        this.logger.log(`User found with username: ${createUserDto.username}`);
        return classToPlain(user) as User;
      }
      this.logger.log(
        `User not found. Creating new user with username: ${createUserDto.username}`,
      );
      user = await this.create(createUserDto);
      return user;
    } catch (error) {
      this.logger.error('Error in findOrCreate method', error.stack);
      throw new HttpException(
        'Failed to find or create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User not found with id: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return classToPlain(user) as User;
    } catch (error) {
      this.logger.error(`Error finding user with id: ${id}`, error.stack);
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
