import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [QueuesModule],
  controllers: [AdminController],
})
export class AdminModule {}
