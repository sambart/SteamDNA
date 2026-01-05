import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SteamService } from './steam.service';

@ApiTags('steam')
@Controller('steam')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get('games/:steamId')
  @ApiOperation({ summary: 'Fetch user owned games' })
  async getOwnedGames(@Param('steamId') steamId: string) {
    return this.steamService.getOwnedGames(steamId);
  }

  @Get('player/:steamId')
  @ApiOperation({ summary: 'Fetch player summary' })
  async getPlayerSummary(@Param('steamId') steamId: string) {
    return this.steamService.getPlayerSummary(steamId);
  }
}
