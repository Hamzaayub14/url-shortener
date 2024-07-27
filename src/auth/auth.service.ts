import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { classToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return { ...user, password: undefined }; // Exclude password
    } catch (error) {
      this.logger.error('Error during user registration', error.stack);
      throw new HttpException(
        'User registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findOne(loginDto.username);
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        User: classToPlain(user),
      };
    } catch (error) {
      this.logger.error('Error during user login', error.stack);
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
