import { Module } from '@nestjs/common';
import { SolanaController } from './sol.controller';

@Module({
  imports: [],
  controllers: [SolanaController],
  providers: [SolanaModule],
})
export class SolanaModule {}