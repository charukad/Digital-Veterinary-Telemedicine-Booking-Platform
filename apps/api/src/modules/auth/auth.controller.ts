import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpService } from './otp.service';
import { VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Req() req, @Body() verifyOtpDto: VerifyOtpDto) {
    await this.otpService.verifyOtp(req.user.userId, verifyOtpDto.code);
    return {
      message: 'Email verified successfully',
      emailVerified: true,
    };
  }

  @Post('resend-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Req() req, @Body() resendOtpDto: ResendOtpDto) {
    await this.otpService.resendOtp(req.user.userId, resendOtpDto.email);
    return {
      message: 'OTP resent successfully. Please check your email.',
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req) {
    return this.authService.refreshTokens(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    return this.authService.validateUser(req.user.userId);
  }
}
