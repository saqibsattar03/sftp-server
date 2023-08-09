import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDto } from '../../data/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-up')
  signUp(@Body() userData: UserDto) {
    return this.authService.signUp(userData);
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  signIn(@Request() request: any): Promise<any> {
    return this.authService.signIn(request.body);
  }
}
