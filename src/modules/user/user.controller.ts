import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getCurrentUser(@CurrentUser() user: object) {
    return user
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users of the entreprise' })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getAllUsers(@CurrentUser() user: { entreprise_id: string, role: { nom: string } }, @Query('page') page: number, @Query('limit') limit: number) {
    return await this.userService.getAllUsers(user.entreprise_id, user.role.nom, page, limit)
  }
}
