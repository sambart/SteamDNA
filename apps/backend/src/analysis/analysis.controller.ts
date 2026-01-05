import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';

@ApiTags('analysis')
@Controller('analysis')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('summary/:userId')
  @ApiOperation({ summary: 'Get user gaming profile summary' })
  async getSummary(@Param('userId') userId: number) {
    return this.analysisService.generateSummary(userId);
  }

  @Get('dashboard/:userId')
  @ApiOperation({ summary: 'Get detailed dashboard data' })
  async getDashboard(@Param('userId') userId: number) {
    return this.analysisService.generateDashboard(userId);
  }
}
