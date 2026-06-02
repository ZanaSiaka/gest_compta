import { Body, Controller, Get, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdatePasswordDto, UpdateProfileDto } from './profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

type MulterFile = NonNullable<Request['file']>

@Controller('profile')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  getCurrentUser(@CurrentUser() user: object) {
    return user
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile ' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updateProfile(@CurrentUser() user: { user_id: string }, @Body() body: UpdateProfileDto) {
    return await this.profileService.updateProfile(user.user_id, body);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update connected user password' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updatePassword(@CurrentUser() user: { user_id: string }, @Body() body: UpdatePasswordDto) {
    return await this.profileService.updatePassword(user.user_id, body);
  }

  @Patch('photo')
  @ApiOperation({ summary: 'Update connected user photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async updatePhoto(@CurrentUser() user: { user_id: string }, @UploadedFile() file: MulterFile) {
    return await this.profileService.updatePhoto(user.user_id, file)
  }

}
