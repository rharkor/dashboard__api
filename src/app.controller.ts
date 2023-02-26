import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './meta/public.meta';
import { AuthService } from './modules/auth/auth.service';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { LocalAuthGuard } from './modules/auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @Get()
  @Public()
  getStatus() {
    return this.appService.getStatus();
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user);
  }

  @Public()
  @Post('auth/register')
  async register(@Body() user: { email: string; password: string }) {
    return this.authService.register(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  getProfile() {
    return 'work!';
  }
}
