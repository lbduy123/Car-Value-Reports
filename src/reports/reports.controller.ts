import { User } from './../users/user.entity';
import { CurrentUser } from './../users/decorators/current-user.decorator';
import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report.dto';
import { ApproveReportDto } from './dtos/approve-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user)
  }

  @Patch('/:id')
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {    
    return this.reportsService.changeApproval(parseInt(id), body.approved)
  }
}
