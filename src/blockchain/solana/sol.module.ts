import { Module } from '@nestjs/common';
import { SolanaController } from './sol.controller';
import { SolanaService } from './sol.service';

@Module({
  imports: [],
  controllers: [SolanaController],
  providers: [SolanaService],
})
export class SolanaModule {}