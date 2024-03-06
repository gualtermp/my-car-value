import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(
    req: Request & { currentUser?: User },
    res: Response,
    next: NextFunction,
  ) {
    const { userId } = req.session || {};
    if (userId) {
      const user = await this.usersService.findOne(userId);

      req.currentUser = user;
    }
    next();
  }
}
