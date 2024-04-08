import { Module } from '@nestjs/common';
import { SolanaController } from './sol.controller';
import { SolanaService } from './sol.service';
import { AIModule } from 'src/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [SolanaController],
  providers: [SolanaService],
})
export class SolanaModule {}