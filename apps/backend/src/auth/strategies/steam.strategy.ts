import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private configService: ConfigService) {
    super({
      returnURL: configService.get('STEAM_RETURN_URL'),
      realm: configService.get('STEAM_REALM'),
      apiKey: configService.get('STEAM_API_KEY'),
    });
  }

  async validate(identifier: string, profile: any): Promise<any> {
    return {
      steamId: profile.id,
      displayName: profile.displayName,
      avatar: profile.photos[2].value,
      profileUrl: profile._json.profileurl,
    };
  }
}
