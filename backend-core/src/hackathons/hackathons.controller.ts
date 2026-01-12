import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, HackathonStatus } from '../common/constants/enums';

@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() createDto: CreateHackathonDto) {
    return this.hackathonsService.create(user.id, createDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.hackathonsService.findAll({ status, category, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard)
  getParticipants(@Param('id') id: string) {
    return this.hackathonsService.getParticipants(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  registerForHackathon(@CurrentUser() user: any, @Param('id') id: string) {
    return this.hackathonsService.registerForHackathon(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateHackathonDto,
  ) {
    return this.hackathonsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.hackathonsService.remove(user.id, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.hackathonsService.updateStatus(user.id, id, status);
  }
}

