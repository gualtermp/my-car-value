import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('email already in use');
    }
    // Hash and salt password
    // 1. Generate salt
    const salt = randomBytes(8).toString('hex');

    // 2. Hash salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // 3. Join the hased result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // Store and return user
    const user = await this.userService.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    // Check if there's an user with the email
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    // Read salt and hash
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('wrong password');
    }

    return user;
  }
}
