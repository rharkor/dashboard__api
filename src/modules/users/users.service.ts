import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(user: { email: string; password: string }): Promise<User> {
    const userObject = this.userRepository.create(user);
    return this.userRepository.save(userObject);
  }
}
