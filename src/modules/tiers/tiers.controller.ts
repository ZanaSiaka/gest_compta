import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TypeTiers } from '../../../generated/prisma/enums';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTiersDto, UpdateTiersDto } from './tiers.dto';

@Controller('tiers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TiersController {
  constructor(private readonly tiersService: TiersService) { }

  @Get()
  @ApiOperation({ summary: 'Get all tiers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: TypeTiers })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getAllTiers(
    @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } },
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('type') type?: string
  ) {
    return await this.tiersService.getAllTiers(user.entreprise.entreprise_id, user.role.role_id, page ? Number(page) : 1, limit ? Number(limit) : 10, search, type)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tiers by ID' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getTiersById(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }) {
    return await this.tiersService.getTiersById(id, user.entreprise.entreprise_id, user.role.role_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tiers' })
  @ApiBody({ type: CreateTiersDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async createTiers(@Body() body: CreateTiersDto, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.tiersService.createTiers(body, user.entreprise.entreprise_id, user.role.role_id, user.user_id)
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a tiers' })
  @ApiBody({ type: UpdateTiersDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updateTiers(@Param('id') id: string, @Body() body: UpdateTiersDto, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.tiersService.updateTiers(id, body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tiers soft delete' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async deleteTiers(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.tiersService.deleteTiers(id, user.entreprise.entreprise_id, user.role.role_id, user.user_id)
  }
}
