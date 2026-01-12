import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AzureSasService } from '../uploads/azure-sas.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, AzureSasService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

