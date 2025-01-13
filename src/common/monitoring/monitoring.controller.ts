import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';

@Controller('metrics')
export class MonitoringController extends PrometheusController {
  @Get()
  @Public()
  async getMetrics(@Res() response: Response) {
    return super.index(response);
  }
}
