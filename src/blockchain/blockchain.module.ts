import { Module } from '@nestjs/common';
//import { EthereumService } from './ethereum/eth.service';
import { SolanaService } from './solana/sol.service';
import { SolanaController } from './solana/sol.controller';

@Module({
    imports: [],
    controllers: [SolanaController],
    providers: [SolanaService],
  })
export class BlockchainModule {}