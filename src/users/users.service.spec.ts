import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user/user';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find a user by username', async () => {
    const username = 'testuser';
    const user = new User();
    user.username = username;

    jest.spyOn(repo, 'findOne').mockResolvedValue(user);

    expect(await service.findOne(username)).toEqual(user);
  });

  it('should create a new user', async () => {
    const user = new User();
    user.username = 'newuser';

    jest.spyOn(repo, 'save').mockResolvedValue(user);
    jest.spyOn(repo, 'create').mockReturnValue(user);

    expect(await service.create(user)).toEqual(user);
  });
});
