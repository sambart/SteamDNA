import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':steamId')
  @ApiOperation({ summary: 'Get user by Steam ID' })
  async getUserBySteamId(@Param('steamId') steamId: string) {
    return this.userService.findBySteamId(steamId);
  }
}
