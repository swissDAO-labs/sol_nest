import { Module } from '@nestjs/common';
//import { EthereumModule } from './ethereum/eth.module';
import { SolanaModule } from './solana/sol.module';
import { AIModule } from 'src/ai/ai.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
    imports: [SolanaModule, AIModule, DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),],
    controllers: [],
    providers: [],
  })
export class BlockchainModule {}