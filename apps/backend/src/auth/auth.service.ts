import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { steamId: user.steamId, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateUser(profile: any): Promise<any> {
    // This will be implemented with UserService
    return profile;
  }
}
