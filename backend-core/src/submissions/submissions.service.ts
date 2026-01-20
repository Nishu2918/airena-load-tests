import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface Submission {
  id: string;
  hackathonId: string;
  submitterId: string;
  submitter?: any; // Submitter details
  teamId?: string;
  teamInfo?: any; // Team details including members
  type: string;
  title: string;
  description: string;
  techStack?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
  presentationUrl?: string;
  files: string; // JSON string
  status: string;
  isDraft: boolean;
  isFinal: boolean;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

@Injectable()
export class SubmissionsService {
  private submissions: Submission[] = [];

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async create(userId: string, createDto: CreateSubmissionDto) {
    // Fetch real user data from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If teamId is provided, fetch team information
    let teamInfo = null;
    if (createDto.teamId) {
      teamInfo = await this.prisma.team.findUnique({
        where: { id: createDto.teamId },
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
      });
    }

    const submission: Submission = {
      id: `submission-${Date.now()}`,
      ...createDto,
      submitterId: userId,
      submitter: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      type: createDto.teamId ? 'TEAM' : 'INDIVIDUAL',
      teamInfo: teamInfo,
      files: JSON.stringify(createDto.files || []),
      status: createDto.isDraft ? 'DRAFT' : 'SUBMITTED',
      isDraft: createDto.isDraft || false,
      isFinal: !createDto.isDraft,
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: createDto.isDraft ? undefined : new Date(),
    };

    this.submissions.push(submission);
    return submission;
  }

  async findAll(filters?: { hackathonId?: string; userId?: string; teamId?: string; status?: string; isDraft?: boolean }, userRole?: string, userId?: string) {
    let filtered = this.submissions;

    if (filters?.hackathonId) {
      filtered = filtered.filter(s => s.hackathonId === filters.hackathonId);
    }

    if (filters?.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    if (filters?.isDraft !== undefined) {
      filtered = filtered.filter(s => s.isDraft === filters.isDraft);
    }

    // Apply userId filter if explicitly provided
    if (filters?.userId) {
      filtered = filtered.filter(s => s.submitterId === filters.userId);
    }

    // Role-based filtering - ONLY filter for participants when they don't specify userId
    if (userRole === 'PARTICIPANT' && !filters?.userId) {
      filtered = filtered.filter(s => s.submitterId === userId);
    }

    // For ORGANIZER and JUDGE roles, show ALL submissions unless specific filters are applied
    // This allows organizers to see all submissions in their hackathons
    // and judges to see all submissions they need to review

    // Ensure all submissions have proper user data
    const enrichedSubmissions = await Promise.all(
      filtered.map(async (submission) => {
        let parsedFiles: any[] = [];
        try {
          parsedFiles = JSON.parse(submission.files);
        } catch (error) {
          parsedFiles = [];
        }

        // If submitter data is missing or incomplete, fetch from database
        let submitter = submission.submitter;
        if (!submitter || submitter.firstName === 'Unknown') {
          try {
            const user = await this.prisma.user.findUnique({
              where: { id: submission.submitterId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            });
            if (user) {
              submitter = user;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }

        // Fetch team info if teamId exists but teamInfo is missing
        let teamInfo = submission.teamInfo;
        if (submission.teamId && !teamInfo) {
          try {
            teamInfo = await this.prisma.team.findUnique({
              where: { id: submission.teamId },
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
            });
          } catch (error) {
            console.error('Error fetching team data:', error);
          }
        }

        return {
          ...submission,
          submitter,
          teamInfo,
          files: parsedFiles,
        };
      })
    );

    return enrichedSubmissions;
  }

  async findOne(id: string, userRole?: string, userId?: string) {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Role-based access control
    const canAccessFiles = userRole === 'ORGANIZER' || userRole === 'JUDGE' || userRole === 'ADMIN';
    const isOwner = userId && submission.submitterId === userId;

    if (!canAccessFiles && !isOwner) {
      throw new ForbiddenException('Access denied');
    }

    let parsedFiles: any[] = [];
    try {
      parsedFiles = JSON.parse(submission.files);
    } catch (error) {
      parsedFiles = [];
    }

    // Ensure proper user data
    let submitter = submission.submitter;
    if (!submitter || submitter.firstName === 'Unknown') {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: submission.submitterId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });
        if (user) {
          submitter = user;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    // Fetch team info if needed
    let teamInfo = submission.teamInfo;
    if (submission.teamId && !teamInfo) {
      try {
        teamInfo = await this.prisma.team.findUnique({
          where: { id: submission.teamId },
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
        });
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    }

    return {
      ...submission,
      submitter,
      teamInfo,
      files: parsedFiles,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateSubmissionDto) {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    Object.assign(submission, updateDto, { 
      updatedAt: new Date(),
      submittedAt: updateDto.isDraft ? undefined : new Date(),
      status: updateDto.isDraft ? 'DRAFT' : 'SUBMITTED',
    });

    return submission;
  }

  async remove(userId: string, id: string) {
    const index = this.submissions.findIndex(s => s.id === id);
    if (index === -1) {
      throw new NotFoundException('Submission not found');
    }

    const submission = this.submissions[index];
    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only delete your own submissions');
    }

    this.submissions.splice(index, 1);
    return { message: 'Submission deleted successfully' };
  }

  async submit(userId: string, id: string) {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only submit your own submissions');
    }

    submission.isDraft = false;
    submission.isFinal = true;
    submission.status = 'SUBMITTED';
    submission.submittedAt = new Date();
    submission.updatedAt = new Date();

    return submission;
  }

  async updateFiles(submissionId: string, userId: string, files: any[]) {
    const submission = this.submissions.find(s => s.id === submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    submission.files = JSON.stringify(files);
    submission.updatedAt = new Date();

    return submission;
  }
}