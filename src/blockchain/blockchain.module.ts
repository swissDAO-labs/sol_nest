import { Module } from '@nestjs/common';
//import { EthereumModule } from './ethereum/eth.module';
import { SolanaModule } from './solana/sol.module';
import { AIModule } from 'src/ai/ai.module';

@Module({
    imports: [SolanaModule, AIModule],
    controllers: [],
    providers: [],
  })
export class BlockchainModule {}