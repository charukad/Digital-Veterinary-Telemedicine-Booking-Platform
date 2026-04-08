import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { CreateReviewReplyDto } from './dto/review-reply.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReviewFilterDto, ReportReviewDto } from './dto/review-filter.dto';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(
    @Query('veterinarianId') veterinarianId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.reviewsService.findAll(veterinarianId, pageNum, limitNum);
  }

  @Get('filtered')
  findAllWithFilters(
    @Query('veterinarianId') veterinarianId: string,
    @Query() filters: ReviewFilterDto,
  ) {
    return this.reviewsService.findAllWithFilters(veterinarianId, filters);
  }

  @Get('breakdown/:veterinarianId')
  getRatingBreakdown(@Param('veterinarianId') veterinarianId: string) {
    return this.reviewsService.getRatingBreakdown(veterinarianId);
  }

  @Get('reported')
  @UseGuards(AdminGuard)
  getReportedReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewsService.getReportedReviews(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('my-reviews')
  findMyReviews(@Req() req) {
    return this.reviewsService.findByOwner(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateReviewDto) {
    return this.reviewsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.reviewsService.delete(id, req.user.userId);
  }

  @Post(':id/reply')
  replyToReview(@Param('id') id: string, @Req() req, @Body() dto: CreateReviewReplyDto) {
    return this.reviewsService.replyToReview(id, req.user.userId, dto.reply);
  }

  @Put(':id/reply')
  updateReply(@Param('id') id: string, @Req() req, @Body() dto: CreateReviewReplyDto) {
    return this.reviewsService.updateReply(id, req.user.userId, dto.reply);
  }

  @Delete(':id/reply')
  deleteReply(@Param('id') id: string, @Req() req) {
    return this.reviewsService.deleteReply(id, req.user.userId);
  }

  @Post(':id/helpful')
  markAsHelpful(@Param('id') id: string, @Req() req) {
    return this.reviewsService.markAsHelpful(id, req.user.userId);
  }

  @Post(':id/report')
  reportReview(@Param('id') id: string, @Req() req, @Body() dto: ReportReviewDto) {
    return this.reviewsService.reportReview(id, req.user.userId, dto.reason);
  }

  @Post(':id/dismiss-report')
  @UseGuards(AdminGuard)
  dismissReport(@Param('id') id: string) {
    return this.reviewsService.dismissReport(id);
  }
}
