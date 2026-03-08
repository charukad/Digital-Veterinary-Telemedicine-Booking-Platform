import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminAnalyticsService } from './admin-analytics.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AdminAnalyticsService,
  ) {}

  // ========== Analytics Endpoints ==========

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth over last 12 months' })
  async getUserGrowth() {
    return this.analyticsService.getUserGrowth();
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics over last 12 months' })
  async getRevenueAnalytics() {
    return this.analyticsService.getRevenueAnalytics();
  }

  @Get('analytics/appointments')
  @ApiOperation({ summary: 'Get appointment analytics by status and type' })
  async getAppointmentAnalytics() {
    return this.analyticsService.getAppointmentAnalytics();
  }

  @Get('analytics/top-vets')
  @ApiOperation({ summary: 'Get top performing veterinarians' })
  async getTopVeterinarians(@Query('limit') limit?: string) {
    return this.analyticsService.getTopVeterinarians(
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get system health metrics' })
  async getSystemHealth() {
    return this.analyticsService.getSystemHealth();
  }

  // ========== Verification Endpoints ==========

  @Get('verification-queue')
  @ApiOperation({ summary: 'Get pending veterinarian verifications' })
  async getVerificationQueue() {
    return this.adminService.getVerificationQueue();
  }

  @Post('verify/:vetId/approve')
  @ApiOperation({ summary: 'Approve veterinarian verification' })
  async approveVeterinarian(@Param('vetId') vetId: string) {
    return this.adminService.approveVeterinarian(vetId);
  }

  @Post('verify/:vetId/reject')
  @ApiOperation({ summary: 'Reject veterinarian verification' })
  async rejectVeterinarian(
    @Param('vetId') vetId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectVeterinarian(vetId, reason);
  }

  // ========== User Management Endpoints ==========

  @Get('stats')
  @ApiOperation({ summary: 'Get quick statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filters' })
  async getAllUsers(
    @Query('type') userType?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(userType, search);
  }

  @Patch('users/:userId/status')
  @ApiOperation({ summary: 'Update user status (suspend/activate)' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(userId, status);
  }
}


@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verification-queue')
  async getVerificationQueue() {
    return this.adminService.getVerificationQueue();
  }

  @Post('verify/:vetId/approve')
  async approveVeterinarian(@Param('vetId') vetId: string) {
    return this.adminService.approveVeterinarian(vetId);
  }

  @Post('verify/:vetId/reject')
  async rejectVeterinarian(
    @Param('vetId') vetId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectVeterinarian(vetId, reason);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // User Management
  @Get('users')
  getAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllUsers({
      search,
      role,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('users/:id')
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.suspendUser(id, reason);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }
}
