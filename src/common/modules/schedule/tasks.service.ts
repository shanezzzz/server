import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTasks() {
    this.logger.log('Running daily tasks...');
    // 在这里添加每日任务
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyTasks() {
    this.logger.log('Running hourly tasks...');
    // 在这里添加每小时任务
  }

  // 自定义定时任务
  @Cron('0 30 9 * * *') // 每天上午9:30执行
  async handleCustomTasks() {
    this.logger.log('Running custom tasks...');
    // 在这里添加自定义任务
  }
}
