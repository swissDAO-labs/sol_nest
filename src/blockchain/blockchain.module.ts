import { Module } from '@nestjs/common';
import { EthereumService } from './ethereum/eth.service';
import { SolanaService } from './solana/sol.service';

@Module({
    providers: [EthereumService, SolanaService],
    exports: [EthereumService, SolanaService],
})
export class BlockchainModule {}