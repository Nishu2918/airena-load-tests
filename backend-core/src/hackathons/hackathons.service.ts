import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { HackathonStatus } from '../common/constants/enums';

@Injectable()
export class HackathonsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateHackathonDto) {
    // Validate dates
    this.validateDates(createDto);

    const hackathon = await this.prisma.hackathon.create({
      data: {
        ...createDto,
        registrationStart: new Date(createDto.registrationStart),
        registrationEnd: new Date(createDto.registrationEnd),
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        submissionDeadline: new Date(createDto.submissionDeadline),
        requirements: typeof createDto.requirements === 'object' 
          ? JSON.stringify(createDto.requirements) 
          : createDto.requirements,
        organizerId: userId,
        status: HackathonStatus.DRAFT,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return hackathon;
  }

  async findAll(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return this.prisma.hackathon.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          include: {
            submitter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return hackathon;
  }

  async getParticipants(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
        },
        submissions: {
          include: {
            submitter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    const participantsMap = new Map<string, any>();

    // SOURCE 1: REGISTERED PARTICIPANTS (HackathonParticipant) - PRIMARY SOURCE
    hackathon.participants.forEach((p) => {
      participantsMap.set(p.user.id, {
        id: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
        registeredAt: p.joinedAt,
        hasSubmission: false,
        submissionId: null,
      });
    });

    // SOURCE 2: TEAM MEMBERS - Add if not already in map
    hackathon.teams.forEach((team) => {
      team.members.forEach((member) => {
        const userId = member.user.id;
        if (!participantsMap.has(userId)) {
          participantsMap.set(userId, {
            id: userId,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            email: member.user.email,
            registeredAt: member.createdAt || new Date(),
            hasSubmission: false,
            submissionId: null,
          });
        }
      });
    });

    // SOURCE 3: SUBMISSIONS - Add if not already in map, update if exists
    hackathon.submissions.forEach((submission) => {
      const userId = submission.submitter?.id;
      if (!userId) return;

      if (!participantsMap.has(userId)) {
        // User submitted but not registered - add them
        participantsMap.set(userId, {
          id: userId,
          firstName: submission.submitter.firstName,
          lastName: submission.submitter.lastName,
          email: submission.submitter.email,
          registeredAt: submission.createdAt,
          hasSubmission: true,
          submissionId: submission.id,
        });
      } else {
        // Update existing participant with submission info
        const existing = participantsMap.get(userId);
        existing.hasSubmission = true;
        existing.submissionId = submission.id;
      }
    });

    // Return exact shape as specified - NO FILTERING
    const result = Array.from(participantsMap.values()).map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      registeredAt: p.registeredAt,
      hasSubmission: p.hasSubmission,
      submissionId: p.submissionId,
    }));

    console.log(`✅ getParticipants(${hackathonId}): Returning ${result.length} participants`);
    return result;
  }

  async registerForHackathon(userId: string, hackathonId: string) {
    const hackathon = await this.findOne(hackathonId);

    // Check if registration is open
    const now = new Date();
    if (now < hackathon.registrationStart || now > hackathon.registrationEnd) {
      throw new BadRequestException('Registration is not open for this hackathon');
    }

    // Check if already registered
    const existing = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (existing) {
      console.log('ℹ️ User already registered:', { userId, hackathonId, participantId: existing.id });
      return { success: true, message: 'You are already registered for this hackathon' };
    }

    // Create registration
    try {
      const participant = await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
        },
      });
      console.log('✅ Registration created successfully:', { 
        participantId: participant.id, 
        userId, 
        hackathonId,
        joinedAt: participant.joinedAt 
      });
      return { success: true, message: 'Successfully registered for hackathon' };
    } catch (error: any) {
      console.error('❌ Failed to create registration:', error);
      throw new BadRequestException(`Failed to register: ${error.message}`);
    }
  }

  async update(userId: string, id: string, updateDto: UpdateHackathonDto) {
    const hackathon = await this.findOne(id);

    // Check ownership - allow organizer to update their own hackathons
    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own hackathons');
    }

    console.log('✅ Update authorized - user is organizer of hackathon:', { userId, hackathonId: id, organizerId: hackathon.organizerId });

    // Validate status transitions
    if (updateDto.status && updateDto.status !== hackathon.status) {
      this.validateStatusTransition(hackathon.status, updateDto.status);
    }

    // Validate dates if provided
    if (updateDto.registrationStart || updateDto.registrationEnd) {
      this.validateDates({
        registrationStart: updateDto.registrationStart || hackathon.registrationStart.toISOString(),
        registrationEnd: updateDto.registrationEnd || hackathon.registrationEnd.toISOString(),
        startDate: updateDto.startDate || hackathon.startDate.toISOString(),
        endDate: updateDto.endDate || hackathon.endDate.toISOString(),
        submissionDeadline: updateDto.submissionDeadline || hackathon.submissionDeadline.toISOString(),
      } as any);
    }

    const updateData: any = {
      ...updateDto,
    };

    // Convert date strings to Date objects if present
    if (updateDto.registrationStart) {
      updateData.registrationStart = new Date(updateDto.registrationStart);
    }
    if (updateDto.registrationEnd) {
      updateData.registrationEnd = new Date(updateDto.registrationEnd);
    }
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.submissionDeadline) {
      updateData.submissionDeadline = new Date(updateDto.submissionDeadline);
    }
    if (updateDto.requirements) {
      updateData.requirements = typeof updateDto.requirements === 'object'
        ? JSON.stringify(updateDto.requirements)
        : updateDto.requirements;
    }

    const updated = await this.prisma.hackathon.update({
      where: { id },
      data: {
        ...updateData,
        publishedAt: updateDto.status === HackathonStatus.PUBLISHED && !hackathon.publishedAt
          ? new Date()
          : hackathon.publishedAt,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const hackathon = await this.findOne(id);

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own hackathons');
    }

    // Prevent deletion if hackathon has started
    const startedStatuses: string[] = [
      HackathonStatus.IN_PROGRESS,
      HackathonStatus.SUBMISSION_OPEN,
      HackathonStatus.SUBMISSION_CLOSED,
      HackathonStatus.JUDGING,
      HackathonStatus.COMPLETED,
    ];
    if (startedStatuses.includes(hackathon.status)) {
      throw new BadRequestException('Cannot delete hackathon that has started');
    }

    await this.prisma.hackathon.delete({
      where: { id },
    });

    return { message: 'Hackathon deleted successfully' };
  }

  async updateStatus(userId: string, id: string, newStatus: string) {
    const hackathon = await this.findOne(id);

    if (hackathon.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own hackathons');
    }

    this.validateStatusTransition(hackathon.status, newStatus);

    const updated = await this.prisma.hackathon.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === HackathonStatus.PUBLISHED && !hackathon.publishedAt
          ? new Date()
          : hackathon.publishedAt,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  // Event Lifecycle Management
  async processLifecycleEvents() {
    const now = new Date();

    // Update hackathons based on current time
    await this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.PUBLISHED,
        registrationStart: { lte: now },
        registrationEnd: { gte: now },
      },
      data: {
        status: HackathonStatus.REGISTRATION_OPEN,
      },
    });

    await this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.REGISTRATION_OPEN,
        registrationEnd: { lt: now },
      },
      data: {
        status: HackathonStatus.REGISTRATION_CLOSED,
      },
    });

    await this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.REGISTRATION_CLOSED,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      data: {
        status: HackathonStatus.IN_PROGRESS,
      },
    });

    await this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.IN_PROGRESS,
        submissionDeadline: { lte: now },
      },
      data: {
        status: HackathonStatus.SUBMISSION_OPEN,
      },
    });

    await this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.SUBMISSION_OPEN,
        submissionDeadline: { lt: now },
      },
      data: {
        status: HackathonStatus.SUBMISSION_CLOSED,
      },
    });
  }

  private validateDates(dto: CreateHackathonDto | any) {
    const registrationStart = new Date(dto.registrationStart);
    const registrationEnd = new Date(dto.registrationEnd);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const submissionDeadline = new Date(dto.submissionDeadline);

    if (registrationEnd <= registrationStart) {
      throw new BadRequestException('Registration end must be after registration start');
    }

    if (startDate < registrationEnd) {
      throw new BadRequestException('Hackathon start must be after registration end');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Hackathon end must be after start');
    }

    if (submissionDeadline > endDate) {
      throw new BadRequestException('Submission deadline must be before or on hackathon end date');
    }

    if (submissionDeadline < startDate) {
      throw new BadRequestException('Submission deadline must be after hackathon start');
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      [HackathonStatus.DRAFT]: [HackathonStatus.PUBLISHED, HackathonStatus.CANCELLED],
      [HackathonStatus.PUBLISHED]: [
        HackathonStatus.REGISTRATION_OPEN,
        HackathonStatus.CANCELLED,
        HackathonStatus.DRAFT,
      ],
      [HackathonStatus.REGISTRATION_OPEN]: [
        HackathonStatus.REGISTRATION_CLOSED,
        HackathonStatus.CANCELLED,
      ],
      [HackathonStatus.REGISTRATION_CLOSED]: [
        HackathonStatus.IN_PROGRESS,
        HackathonStatus.CANCELLED,
      ],
      [HackathonStatus.IN_PROGRESS]: [
        HackathonStatus.SUBMISSION_OPEN,
        HackathonStatus.CANCELLED,
      ],
      [HackathonStatus.SUBMISSION_OPEN]: [
        HackathonStatus.SUBMISSION_CLOSED,
        HackathonStatus.CANCELLED,
      ],
      [HackathonStatus.SUBMISSION_CLOSED]: [
        HackathonStatus.JUDGING,
        HackathonStatus.CANCELLED,
      ],
      [HackathonStatus.JUDGING]: [HackathonStatus.COMPLETED],
      [HackathonStatus.COMPLETED]: [],
      [HackathonStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

