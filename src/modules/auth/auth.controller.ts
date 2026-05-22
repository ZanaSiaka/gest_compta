import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: '2XX', description: 'Success' })
  @ApiResponse({ status: '4XX', description: 'Client error' })
  @ApiResponse({ status: '5XX', description: 'Server error' })
  async login(@Body() body: LoginDto) {
    const validation = await this.authService.validateUser(body);

    if (!validation.success) {
      return validation;
    }

    return this.authService.login({
      user_id: validation.data.user_id,
      email: validation.data.email,
      entreprise_id: validation.data.entreprise_id,
      nom: validation.data.nom,
      prenom: validation.data.prenom
    })
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.authService.refresh(body.refresh_token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: '2XX' })
  @ApiResponse({ status: '4XX' })
  @ApiResponse({ status: '5XX' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }

}
