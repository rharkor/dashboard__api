import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare as bcryptCompare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email, true);
    if (user && (await bcryptCompare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { email: string; password: string }) {
    const foundUser = await this.usersService.findOne(user.email, true);
    if (!foundUser) throw new Error('Invalid credentials');
    if (!(await bcryptCompare(user.password, foundUser.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: { email: string; password: string }) {
    const foundUser = await this.usersService.findOne(user.email, true);
    if (foundUser) throw new Error('User already exists');
    const hashedPassword = await hash(user.password, 10);
    user.password = hashedPassword;
    const payload = { email: user.email };
    await this.usersService.create(user);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
