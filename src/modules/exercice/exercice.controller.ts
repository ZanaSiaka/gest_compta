import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExerciceService } from './exercice.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateExerciceDto, UpdateExerciceDto } from './exercice.dto';

@Controller('exercice')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ExerciceController {
  constructor(private readonly exerciceService: ExerciceService) { }

  @Get()
  @ApiOperation({ summary: 'Get all exercices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par libellé' })
  @ApiQuery({ name: 'dateDebut', required: false, type: String, description: 'Filtrer par date de début (ex: 2024-01-01)' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getAllExercice(
    @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } },
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('dateDebut') dateDebut?: string
  ) {
    return await this.exerciceService.getAllExercices(user.entreprise.entreprise_id, user.role.role_id, page ? Number(page) : 1, limit ? Number(limit) : 10, search, dateDebut)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercice by ID' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getExerciceById(@Param("id") id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }) {
    return await this.exerciceService.getExerciceById(id, user.entreprise.entreprise_id, user.role.role_id)
  }

  @Post()
  @ApiOperation({ summary: 'Create an exercice' })
  @ApiBody({ type: CreateExerciceDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async createExercice(@Body() body: CreateExerciceDto, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.exerciceService.createExercice(body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exercice' })
  @ApiBody({ type: UpdateExerciceDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updateExercice(@Param('id') id: string, @Body() body: UpdateExerciceDto, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.exerciceService.updateExercice(id, body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Patch(':id/clos')
  @ApiOperation({ summary: 'Close an exercice' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async clotureExercice(@Param('id') id: string, @CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string }, user_id: string }) {
    return await this.exerciceService.cloturerExercice(id, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }
}
