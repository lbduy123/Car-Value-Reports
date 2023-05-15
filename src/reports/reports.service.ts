import { User } from './../users/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto)
    report.user = user
    return this.repo.save(report)
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.repo.findOneBy({ id })
    if (!report) {
      throw new NotFoundException('Report not found')
    }
    report.approved = approved
    return this.repo.save(report)
  }
}
