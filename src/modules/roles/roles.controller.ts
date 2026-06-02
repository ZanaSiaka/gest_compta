import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateRoleDto, UpdatePermissionsDto, UpdateRoleDto } from './roles.dto';

@Controller('roles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all roles of the entreprise' })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getAllRoles(@CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }, @Query('page') page: number, @Query('limit') limit: number) {
    return await this.rolesService.getAllRoles(user.entreprise.entreprise_id, user.role.role_id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by its ID' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async getRoleById(@CurrentUser() user: { entreprise: { entreprise_id: string }, role: { role_id: string } }, @Param('id') id: string) {
    return await this.rolesService.getRoleById(id, user.entreprise.entreprise_id, user.role.role_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: '2XX', description: 'Role created successfully' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async createRole(@CurrentUser() user: { entreprise: { entreprise_id: string }, user_id: string, role: { role_id: string } }, @Body() body: CreateRoleDto) {
    return await this.rolesService.createRole(body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role by its ID' })
  @ApiResponse({ status: '2XX', description: 'Role deleted successfully' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async deleteRole(@CurrentUser() user: { entreprise: { entreprise_id: string }, user_id: string, role: { role_id: string } }, @Param('id') id: string) {
    return await this.rolesService.deleteRole(id, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role by its ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: '2XX', description: 'Role updated successfully' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updateRole(@CurrentUser() user: { entreprise: { entreprise_id: string }, user_id: string, role: { role_id: string } }, @Param('id') id: string, @Body() body: UpdateRoleDto) {
    return await this.rolesService.updateRole(id, body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update permissions of a role by its ID' })
  @ApiBody({ type: UpdatePermissionsDto })
  @ApiResponse({ status: '2XX', description: 'Permissions updated successfully' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updatePermissions(@CurrentUser() user: { entreprise: { entreprise_id: string }, user_id: string, role: { role_id: string } }, @Param('id') id: string, @Body() body: UpdatePermissionsDto) {
    return await this.rolesService.updatePermissions(id, body, user.entreprise.entreprise_id, user.role.role_id, user.user_id);
  }


}
