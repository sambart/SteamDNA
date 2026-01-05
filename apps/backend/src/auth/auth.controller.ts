import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  @ApiOperation({ summary: 'Initiate Steam OAuth login' })
  async steamAuth() {
    // Guard redirects to Steam
  }

  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  @ApiOperation({ summary: 'Steam OAuth callback' })
  async steamAuthCallback(@Req() req, @Res() res) {
    const token = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    return req.user;
  }
}
