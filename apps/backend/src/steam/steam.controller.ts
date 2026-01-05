import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SteamService } from './steam.service';

@ApiTags('steam')
@Controller('steam')
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get('user/:identifier')
  @ApiOperation({ summary: 'Fetch complete Steam user data' })
  @ApiParam({ name: 'identifier', description: 'Steam ID64, vanity URL name, or profile URL' })
  async getUserData(@Param('identifier') identifier: string) {
    const steamId = await this.steamService.resolveIdentifier(identifier);
    return this.steamService.getCompleteUserData(steamId);
  }

  @Get('games/:identifier')
  @ApiOperation({ summary: 'Fetch user owned games' })
  @ApiParam({ name: 'identifier', description: 'Steam ID64, vanity URL name, or profile URL' })
  async getOwnedGames(@Param('identifier') identifier: string) {
    const steamId = await this.steamService.resolveIdentifier(identifier);
    return this.steamService.getOwnedGames(steamId);
  }

  @Get('player/:identifier')
  @ApiOperation({ summary: 'Fetch player summary' })
  @ApiParam({ name: 'identifier', description: 'Steam ID64, vanity URL name, or profile URL' })
  async getPlayerSummary(@Param('identifier') identifier: string) {
    const steamId = await this.steamService.resolveIdentifier(identifier);
    return this.steamService.getPlayerSummary(steamId);
  }
}
