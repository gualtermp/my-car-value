import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of UsersService
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999), email, password };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create as instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdf@gmail.com', 'passss');
    expect(user.password).not.toEqual('passss');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email already in use', async () => {
    await service.signup('a@p.com', 'p1');
    await expect(service.signup('a@p.com', 'p1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with unused email', async () => {
    await expect(service.signin('a@p.com', 'p1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if invalid password is provided', async () => {
    await service.signup('a@p.com', 'p5555');
    await expect(service.signin('a@p.com', 'p2')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns user if correct password is provided', async () => {
    await service.signup('a@p.com', 'p2');
    const user = await service.signin('a@p.com', 'p2');
    expect(user).toBeDefined();
  });
});
