import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateReviewDto) {
    // Get pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can write reviews');
    }

    // If appointmentId provided, verify appointment and check if already reviewed
    if (createDto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: createDto.appointmentId },
        include: { review: true },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.ownerId !== petOwner.id) {
        throw new ForbiddenException('You can only review your own appointments');
      }

      if (appointment.status !== 'COMPLETED') {
        throw new BadRequestException('Can only review completed appointments');
      }

      if (appointment.review) {
        throw new BadRequestException('Appointment already reviewed');
      }
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        ...createDto,
        petOwnerId: petOwner.id,
      },
      include: {
        petOwner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return review;
  }

  async getRatingBreakdown(veterinarianId: string) {
    // Get all reviews for the vet
    const reviews = await this.prisma.review.findMany({
      where: { veterinarianId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        breakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        percentages: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    // Calculate breakdown
    const breakdown = reviews.reduce(
      (acc, review) => {
        const rating = Number(review.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    );

    // Calculate percentages
    const percentages = {
      5: (breakdown[5] / totalReviews) * 100,
      4: (breakdown[4] / totalReviews) * 100,
      3: (breakdown[3] / totalReviews) * 100,
      2: (breakdown[2] / totalReviews) * 100,
      1: (breakdown[1] / totalReviews) * 100,
    };

    // Calculate average
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const averageRating = sum / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      breakdown,
      percentages,
    };
  }

  async findAll(veterinarianId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: veterinarianId ? { veterinarianId } : {},
        include: {
          petOwner: { // Changed from 'user' to 'petOwner' to match existing schema usage
            select: {
              userId: true, // Assuming petOwner has a userId field
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: veterinarianId ? { veterinarianId } : {},
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByVeterinarian(veterinarianId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { veterinarianId },
      include: {
        petOwner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    };
  }

  async findByOwner(userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      return [];
    }

    return this.prisma.review.findMany({
      where: { petOwnerId: petOwner.id },
      include: {
        veterinarian: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(reviewId: string, userId: string, updateDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        petOwner: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.petOwner.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateDto,
    });
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        petOwner: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.petOwner.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async replyToReview(reviewId: string, userId: string, reply: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { veterinarian: { select: { userId: true } } },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.veterinarian.userId !== userId) {
      throw new ForbiddenException('You can only reply to your own reviews');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { reply, repliedAt: new Date() },
    });
  }

  async updateReply(reviewId: string, userId: string, reply: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { veterinarian: { select: { userId: true } } },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.veterinarian.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { reply },
    });
  }

  async deleteReply(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { veterinarian: { select: { userId: true } } },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.veterinarian.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { reply: null, repliedAt: null },
    });
  }

  /**
   * Get reviews with advanced filtering and sorting
   */
  async findAllWithFilters(
    veterinarianId: string,
    filters: {
      sortBy?: string;
      minRating?: number;
      maxRating?: number;
      page?: number;
      limit?: number;
    },
  ) {
    const { sortBy = 'newest', minRating, maxRating, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { veterinarianId };

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating.gte = minRating;
      if (maxRating) where.rating.lte = maxRating;
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'most_helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark review as helpful
   */
  async markAsHelpful(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Increment helpful count
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: string, userId: string, reason: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reported) {
      throw new BadRequestException('Review already reported');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reported: true,
        reportReason: reason,
        reportedBy: userId,
      },
    });
  }

  /**
   * Get reported reviews (admin only)
   */
  async getReportedReviews(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reported: true },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          veterinarian: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { reported: true } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Dismiss report (admin only)
   */
  async dismissReport(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reported: false,
        reportReason: null,
        reportedBy: null,
      },
    });
  }
}
