import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'ab@gmail.com', password: 'pass' });
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'pass' }]);
      },
    };

    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password });
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns list of users with given email', async () => {
    const users = await controller.findAllUsers('ab@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('ab@gmail.com');
  });

  it('findUser returns correct user for gien id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('signIn updates sessions object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'a@g.com', password: 'pass' },
      session,
    );
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
