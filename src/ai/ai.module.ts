import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService], // Make AIService available for import by other modules
})
export class AIModule {}