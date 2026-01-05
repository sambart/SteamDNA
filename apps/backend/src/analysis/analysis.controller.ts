import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { SteamService } from '../steam/steam.service';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly steamService: SteamService,
  ) {}

  @Get('summary/:identifier')
  @ApiOperation({ summary: 'Get user gaming profile summary' })
  @ApiParam({ name: 'identifier', description: 'Steam ID64, vanity URL name, or profile URL' })
  async getSummary(@Param('identifier') identifier: string) {
    const steamId = await this.steamService.resolveIdentifier(identifier);
    const steamData = await this.steamService.getCompleteUserData(steamId);
    return this.analysisService.generateSummary(steamData);
  }

  @Get('dashboard/:identifier')
  @ApiOperation({ summary: 'Get detailed dashboard data' })
  @ApiParam({ name: 'identifier', description: 'Steam ID64, vanity URL name, or profile URL' })
  async getDashboard(@Param('identifier') identifier: string) {
    const steamId = await this.steamService.resolveIdentifier(identifier);
    const steamData = await this.steamService.getCompleteUserData(steamId);
    return this.analysisService.generateDashboard(steamData);
  }
}
