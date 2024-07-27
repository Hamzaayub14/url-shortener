import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/entities/user/user';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should create a new user and return the user object', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
      };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user: User = {
        id: 1,
        username: 'testuser',
        password: hashedPassword,
        email: 'test@example.com',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      expect(await authService.register(createUserDto)).toEqual(user);
    });
  });

  describe('validateUser', () => {
    it('should return user object if validation succeeds', async () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('testpass', 10),
        email: 'test@example.com',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      expect(await authService.validateUser('testuser', 'testpass')).toEqual(
        expect.objectContaining({ username: 'testuser' }),
      );
    });

    it('should return null if validation fails', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      expect(
        await authService.validateUser('nonexistentuser', 'testpass'),
      ).toBeNull();
    });
  });
});
