import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MLService } from './ml.service';

@ApiTags('ml')
@Controller('ml')
export class MLController {
  constructor(private readonly mlService: MLService) {}

  @Get('personas')
  @ApiOperation({ summary: 'Get available gaming personas from ML service' })
  async getPersonas() {
    return this.mlService.getPersonas();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check ML service health' })
  async healthCheck() {
    const isHealthy = await this.mlService.healthCheck();
    return {
      mlService: isHealthy ? 'healthy' : 'unhealthy',
      status: isHealthy ? 200 : 503,
    };
  }
}
