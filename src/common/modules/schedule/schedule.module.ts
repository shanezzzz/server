import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Module({
  imports: [NestScheduleModule.forRoot()],
  providers: [TasksService],
  exports: [TasksService],
})
export class ScheduleModule {}
