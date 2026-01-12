import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionStatus, SubmissionType, HackathonStatus } from '../common/constants/enums';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AzureSasService } from '../uploads/azure-sas.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private azureSasService: AzureSasService,
  ) {}

  async create(userId: string, createDto: CreateSubmissionDto) {
    console.log('📝 Creating submission with userId:', userId);
    console.log('📝 Submission data:', { hackathonId: createDto.hackathonId, title: createDto.title });
    
    const { hackathonId, teamId, isDraft, ...submissionData } = createDto;

    // Verify hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // PHASE 1: REGISTRATION CHECK - User MUST be registered
    const registration = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You must register for this hackathon before submitting');
    }

    // PHASE 2: SUBMISSION WINDOW CHECK
    const now = new Date();
    const submissionStart = hackathon.startDate; // Submission window opens at hackathon start
    const submissionEnd = hackathon.submissionDeadline;

    if (now < submissionStart) {
      throw new BadRequestException('Submission window has not opened yet');
    }

    if (now > submissionEnd) {
      throw new BadRequestException('Submission deadline has passed. Submissions are now locked');
    }

    // Verify team membership if team submission
    let submissionType: string = SubmissionType.INDIVIDUAL;
    if (teamId) {
      const teamMember = await this.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      if (!teamMember || teamMember.status !== 'ACCEPTED') {
        throw new ForbiddenException('You are not a member of this team');
      }

      submissionType = SubmissionType.TEAM;

      // Check if team already has a submission
      const existingSubmission = await this.prisma.submission.findFirst({
        where: {
          hackathonId,
          teamId,
          isFinal: true,
        },
      });

      if (existingSubmission) {
        throw new BadRequestException('Team already has a final submission');
      }
    } else {
      // Check if user already has an individual submission
      const existingSubmission = await this.prisma.submission.findFirst({
        where: {
          hackathonId,
          submitterId: userId,
          teamId: null,
          isFinal: true,
        },
      });

      console.log('🔍 Checking for existing submission:', {
        hackathonId,
        submitterId: userId,
        found: !!existingSubmission,
        existingSubmissionId: existingSubmission?.id
      });

      if (existingSubmission) {
        console.log('⚠️ User already has a final submission:', existingSubmission.id);
        throw new BadRequestException('You already have a final submission');
      }
    }

    // Create submission
    console.log('✅ Creating submission with submitterId:', userId);
    console.log('📋 Submission details:', {
      hackathonId,
      submitterId: userId,
      title: submissionData.title,
      isDraft: isDraft ?? true,
      filesCount: createDto.files?.length || 0,
      files: createDto.files
    });
    
    const filesData = typeof createDto.files === 'object' 
      ? JSON.stringify(createDto.files || []) 
      : (createDto.files || '[]');
    
    console.log('📁 Files data to save:', filesData.substring(0, 200) + '...');
    
    const submission = await this.prisma.submission.create({
      data: {
        ...submissionData,
        hackathonId,
        submitterId: userId, // This should be the authenticated user's ID
        teamId: teamId || null,
        type: submissionType,
        status: isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
        isDraft: isDraft ?? true,
        isFinal: !isDraft,
        submittedAt: isDraft ? null : new Date(),
        files: filesData,
      },
      include: {
        hackathon: true,
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: teamId
          ? {
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
            }
          : undefined,
      },
    });

    console.log('✅ Submission saved to database:', {
      id: submission.id,
      submitterId: submission.submitterId,
      submitterEmail: submission.submitter?.email,
      hackathonId: submission.hackathonId,
      isDraft: submission.isDraft,
      isFinal: submission.isFinal,
      filesCount: typeof submission.files === 'string' ? JSON.parse(submission.files).length : 0
    });

    // CRITICAL: Ensure participant is created when user joins/creates submission
    try {
      const participant = await this.prisma.hackathonParticipant.upsert({
        where: {
          hackathonId_userId: {
            hackathonId,
            userId,
          },
        },
        update: {},
        create: {
          hackathonId,
          userId,
        },
      });
      console.log('✅ Participant record ensured for user:', userId, 'Participant ID:', participant.id);
    } catch (error) {
      console.error('❌ Failed to create/update participant record:', error);
      // Don't throw - submission was created successfully, participant record is secondary
    }

    // AI review removed as per user request

    return submission;
  }

  async findAll(filters?: {
    hackathonId?: string;
    userId?: string;
    teamId?: string;
    status?: string;
    isDraft?: boolean;
  }, userRole?: string, userId?: string) {
    const where: any = {};

    if (filters?.hackathonId) {
      where.hackathonId = filters.hackathonId;
    }

    if (filters?.userId) {
      where.submitterId = filters.userId;
    }

    if (filters?.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isDraft !== undefined) {
      where.isDraft = filters.isDraft;
    }

    const submissions = await this.prisma.submission.findMany({
      where,
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse files from JSON string to array for each submission
    return submissions.map((submission) => {
      let parsedFiles: any[] = [];
      if (submission.files) {
        try {
          if (typeof submission.files === 'string') {
            const parsed = JSON.parse(submission.files);
            parsedFiles = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(submission.files)) {
            parsedFiles = submission.files;
          }
        } catch (error) {
          console.error('Error parsing submission files:', error);
          parsedFiles = [];
        }
      }
      
      // CRITICAL: Normalize and validate files - ensure all have url
      const validFiles = parsedFiles.filter((file: any) => {
        if (typeof file === 'string') {
          return file.startsWith('http://') || file.startsWith('https://');
        }
        if (typeof file === 'object' && file !== null) {
          return file.url && typeof file.url === 'string';
        }
        return false;
      }).map((file: any) => {
        if (typeof file === 'string') {
          return {
            name: file.split('/').pop() || 'File',
            url: file,
            size: 0,
          };
        }
        return {
          name: file.name || file.url?.split('/').pop() || 'File',
          url: file.url,
          size: file.size || 0,
          type: file.type || file.mimeType,
        };
      });
      
      // ROLE-BASED FILE ACCESS: Generate SAS URLs only for ORGANIZER and JUDGE
      const canAccessFiles = userRole === 'ORGANIZER' || userRole === 'JUDGE' || userRole === 'ADMIN';
      const isOwner = userId && submission.submitterId === userId;
      
      const filesWithSas = validFiles.map((file: any) => {
        // Extract blob path from Azure URL if present
        const azureUrlPattern = /https:\/\/([^\.]+)\.blob\.core\.windows\.net\/([^\/]+)\/(.+)/;
        const match = file.url?.match(azureUrlPattern);
        
        if (match && canAccessFiles) {
          const [, accountName, containerName, blobPath] = match;
          // Generate SAS URL that expires at hackathon end date
          const expiresAt = (submission.hackathon as any)?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          try {
            const sasUrl = this.azureSasService.generateReadOnlySas(blobPath, expiresAt);
            return {
              ...file,
              downloadUrl: sasUrl,
              url: sasUrl, // Replace original URL with SAS URL for authorized users
            };
          } catch (error) {
            // If SAS generation fails (e.g., Azure not configured), return original file URL
            console.warn('SAS URL generation failed, using original URL:', error);
            return {
              ...file,
              downloadUrl: file.url, // Fallback to original URL
            };
          }
        }
        
        // PARTICIPANTS: Never see SAS URLs, only see their own files without SAS
        if (isOwner && !canAccessFiles) {
          return {
            ...file,
            downloadUrl: null, // No SAS URL for participants
          };
        }
        
        // If not owner and not authorized, don't return file
        if (!isOwner && !canAccessFiles) {
          return null;
        }
        
        return file;
      }).filter(Boolean);
      
      return {
        ...submission,
        files: filesWithSas, // Always an array, never null
      };
    });
  }

  async findOne(id: string, userRole?: string, userId?: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        hackathon: true,
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: {
            judge: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Parse files from JSON string to array for frontend
    // CRITICAL: Always return files as array, never null or undefined
    let parsedFiles: any[] = [];
    if (submission.files) {
      try {
        if (typeof submission.files === 'string') {
          const parsed = JSON.parse(submission.files);
          parsedFiles = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(submission.files)) {
          parsedFiles = submission.files;
        }
      } catch (error) {
        console.error('Error parsing submission files:', error);
        parsedFiles = [];
      }
    }

    // CRITICAL: Ensure files array contains valid file objects with url
    // Filter out any invalid entries but keep all valid files
    const validFiles = parsedFiles.filter((file: any) => {
      // Accept files with url property (string or object with url)
      if (typeof file === 'string') {
        // If it's a string URL, convert to object
        return file.startsWith('http://') || file.startsWith('https://');
      }
      if (typeof file === 'object' && file !== null) {
        // Must have url property
        return file.url && (typeof file.url === 'string');
      }
      return false;
    }).map((file: any) => {
      // Normalize file objects
      if (typeof file === 'string') {
        return {
          name: file.split('/').pop() || 'File',
          url: file,
          size: 0,
        };
      }
      return {
        name: file.name || file.url?.split('/').pop() || 'File',
        url: file.url,
        size: file.size || 0,
        type: file.type || file.mimeType,
      };
    });

    console.log(`✅ Submission ${id} files: ${validFiles.length} valid files from ${parsedFiles.length} parsed`);

    // ROLE-BASED FILE ACCESS: Generate SAS URLs only for ORGANIZER and JUDGE
    const canAccessFiles = userRole === 'ORGANIZER' || userRole === 'JUDGE' || userRole === 'ADMIN';
    const isOwner = userId && submission.submitterId === userId;

    const filesWithSas = validFiles.map((file: any) => {
      // Extract blob path from Azure URL if present
      const azureUrlPattern = /https:\/\/([^\.]+)\.blob\.core\.windows\.net\/([^\/]+)\/(.+)/;
      const match = file.url?.match(azureUrlPattern);
      
      if (match && canAccessFiles) {
        const [, accountName, containerName, blobPath] = match;
        // Generate SAS URL that expires at hackathon end date
        const expiresAt = submission.hackathon.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        try {
          const sasUrl = this.azureSasService.generateReadOnlySas(blobPath, expiresAt);
          return {
            ...file,
            downloadUrl: sasUrl,
            url: sasUrl, // Replace original URL with SAS URL for authorized users
          };
        } catch (error) {
          // If SAS generation fails (e.g., Azure not configured), return original file URL
          console.warn('SAS URL generation failed, using original URL:', error);
          return {
            ...file,
            downloadUrl: file.url, // Fallback to original URL
          };
        }
      }
      
      // PARTICIPANTS: Never see SAS URLs, only see their own files without SAS
      if (isOwner && !canAccessFiles) {
        return {
          ...file,
          downloadUrl: null, // No SAS URL for participants
        };
      }
      
      // If not owner and not authorized, don't return file
      if (!isOwner && !canAccessFiles) {
        return null;
      }
      
      return file;
    }).filter(Boolean);

    // Return submission with parsed files array (always an array, never null)
    return {
      ...submission,
      files: filesWithSas,
    };
  }

  async update(userId: string, id: string, updateDto: UpdateSubmissionDto) {
    const submission = await this.findOne(id);

    // Check ownership
    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    // PHASE 3: LOCKED - Check if submission deadline has passed
    const now = new Date();
    if (now > submission.hackathon.submissionDeadline) {
      throw new BadRequestException('Submission deadline has passed. Submissions are now locked and cannot be edited');
    }

    // Prevent updates to final submissions
    if (submission.isFinal && !submission.isDraft) {
      throw new BadRequestException('Cannot update final submission');
    }

    // If marking as final, validate
    if (updateDto.isFinal && !submission.isFinal) {
      if (!submission.title || !submission.description) {
        throw new BadRequestException('Submission must have title and description');
      }

      // Update status and trigger AI review
      // Exclude hackathonId and teamId from update (they shouldn't be changed)
      const { hackathonId, teamId, files, ...updateData } = updateDto;
      const updatePayload: any = {
        ...updateData,
        isFinal: true,
        isDraft: false,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      };
      
      // Handle files field - stringify if it's an array
      if (files !== undefined) {
        updatePayload.files = typeof files === 'object' 
          ? JSON.stringify(files) 
          : files;
      }
      
      const updated = await this.prisma.submission.update({
        where: { id },
        data: updatePayload,
        include: {
          hackathon: true,
          submitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // AI review removed as per user request

      return updated;
    }

    // Exclude hackathonId and teamId from update (they shouldn't be changed)
    const { hackathonId, teamId, files, ...updateData } = updateDto;
    const updatePayload: any = { ...updateData };
    
    // Handle files field - stringify if it's an array
    if (files !== undefined) {
      updatePayload.files = typeof files === 'object' 
        ? JSON.stringify(files) 
        : files;
    }
    
    return this.prisma.submission.update({
      where: { id },
      data: updatePayload,
      include: {
        hackathon: true,
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const submission = await this.findOne(id);

    if (submission.submitterId !== userId) {
      throw new ForbiddenException('You can only delete your own submissions');
    }

    // Prevent deletion of final submissions
    if (submission.isFinal) {
      throw new BadRequestException('Cannot delete final submission');
    }

    await this.prisma.submission.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }

  private async triggerAIReview(submissionId: string) {
    const submission = await this.findOne(submissionId);

    try {
      const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
      const aiServiceApiKey = this.configService.get<string>('AI_SERVICE_API_KEY') || 'default-api-key';
      
      if (!aiServiceUrl || aiServiceApiKey === 'default-api-key') {
        console.warn('⚠️  AI Service not properly configured. Skipping AI review.');
        console.warn('   Set AI_SERVICE_URL and AI_SERVICE_API_KEY in .env to enable AI analysis.');
        // Update submission status to indicate manual review needed
        await this.prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.PASSED_TO_OFFLINE_REVIEW,
            aiExplanation: 'AI service not configured. Submission passed for manual review.',
          },
        });
        return;
      }

      // Call AI Service for analysis
      const response = await firstValueFrom(
        this.httpService.post(
          `${aiServiceUrl}/analyze`,
          {
            submissionId: submission.id,
            hackathonId: submission.hackathonId,
            title: submission.title,
            description: submission.description,
            requirements: typeof submission.hackathon.requirements === 'string'
              ? JSON.parse(submission.hackathon.requirements)
              : submission.hackathon.requirements,
          },
          {
            headers: {
              'X-API-Key': aiServiceApiKey,
            },
          },
        ),
      );

      const aiResult = response.data;

      // Update submission with AI results
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.AI_REVIEWED,
          aiReviewResult: JSON.stringify(aiResult),
          aiMatchPercentage: aiResult.matchPercentage,
          aiDecision: aiResult.decision,
          aiExplanation: aiResult.explanation,
        },
      });

      // Update status based on AI decision
      if (aiResult.decision === 'PASS_TO_OFFLINE_REVIEW') {
        await this.prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.PASSED_TO_OFFLINE_REVIEW,
          },
        });
      } else if (aiResult.decision === 'NEEDS_IMPROVEMENT') {
        await this.prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.NEEDS_IMPROVEMENT,
          },
        });
      } else if (aiResult.decision === 'REJECTED') {
        await this.prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.REJECTED,
          },
        });
      }
    } catch (error) {
      // Log error but don't fail submission
      console.error('AI Review failed:', error);
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.UNDER_AI_REVIEW,
        },
      });
    }
  }
}

