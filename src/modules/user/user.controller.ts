import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users of the entreprise' })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getAllUsers(@CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }, @Query('page') page: number, @Query('limit') limit: number) {
    return await this.userService.getAllUsers(user.entreprise.entreprise_id, user.role.role_id, page, limit)
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: '2XX', description: 'User created successfully' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async createUser(@CurrentUser() user: { entreprise: { entreprise_id: string }, user_id: string, role: { role_id: string } }, @Body() body: CreateUserDto) {
    return await this.userService.createUser(body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an user by ID' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getUserById(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }) {
    return await this.userService.getUserById(id, user.entreprise.entreprise_id, user.role.role_id)
  }


  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.userService.updateUser(id, body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Patch(':id/unlock')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock an user account' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async unlockUser(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.userService.unlockUser(id, user.entreprise.entreprise_id, user.role.role_id, user.user_id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an user with soft delete" })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async deleteUser(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.userService.deleteUser(id, user.entreprise.entreprise_id, user.role.role_id, user.user_id)
  }
}
