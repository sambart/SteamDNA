import { Module } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';

@Module({
  controllers: [SteamController],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
