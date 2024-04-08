import { Controller, Get, ParseIntPipe, HttpException, HttpStatus, Param, Res, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SolanaService } from './sol.service';
import { BlockResponse } from '@solana/web3.js';

@ApiTags('Solana')
@Controller('solana')
export class SolanaController {
    constructor(private readonly solanaService: SolanaService) {}

    @ApiOperation({summary: 'Check connection'})
    @ApiResponse({status: 200, description: 'Connection established'})
    @ApiResponse({status: 500, description: 'Internal Server Error'})
    @ApiParam({name: 'rpcUrl', description: 'RPC URL', type: String})
    @Get('connection/:rpcUrl')
    async checkConnection(
        @Param('rpcUrl') rpcUrl: string
    ): Promise<{message: string}> {
        try {
            this.solanaService.getConnection(rpcUrl);
            return { message: 'Connection established' };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Get current block number' })
    @ApiResponse({ status: 200, description: 'Current block number', type: Number })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    @ApiParam({ name: 'rpcUrl', description: 'RPC URL', type: String })
    @Get('block/:rpcUrl')
    async getCurrentBlock(
        @Param('rpcUrl') rpcUrl: string
    ): Promise<number> {
        try {
            return await this.solanaService.getLastBlock(rpcUrl);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Get block data' })
    @ApiResponse({ status: 200, description: 'The block data', type: Object })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    @ApiParam({ name: 'rpcUrl', description: 'RPC URL', type: String })
    @ApiParam({ name: 'block', description: 'Block number', type: Number })
    @Get('block/:rpcUrl/:block')
    async getBlockData(
        @Param('block', ParseIntPipe) block: number,
        @Param('rpcUrl') rpcUrl: string
    ): Promise<BlockResponse> {
        try {
            return await this.solanaService.getBlockData(rpcUrl, block);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @ApiOperation({ summary: 'Generate metadata' })
    @ApiResponse({ status: 200, description: 'Generated metadata', type: Object })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    @ApiResponse({ status: 504, description: 'Timeout' })
    @ApiParam({ name: 'prompt', description: 'Prompt', type: String })
    @ApiParam({ name: 'userInput', description: 'User input', type: String })
    @Get('generate/:prompt/:userInput')
    async generateMetadata(@Param('prompt') prompt: string, @Param('userInput') userInput: string) {
        try {
            const metaData = await this.solanaService.generateMetadata(prompt, userInput);
            return { metaData };
        } catch (error) {
            throw new HttpException('Failed to generate metadata: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'mint NFT' })
    @ApiResponse({ status: 200, description: 'NFT minted', type: Object })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    @ApiParam({ name: 'walletAdress', description: 'Wallet Adress', type: String })
    @ApiParam({ name: 'prompt', description: 'Prompt', type: String })
    @ApiParam({ name: 'userInput', description: 'User input', type: String })
    
    @Post('mintNFT/:walletAddress/:prompt/:userInput')
    async mintNFT(@Body() mintRequest: { walletAddress: string; prompt: string; userInput: string}) {
        const { walletAddress, prompt, userInput } = mintRequest;
        try {
            const result = await this.solanaService.mintNFT(walletAddress, prompt, userInput);
            return result;
        } catch (error) {
            throw new HttpException(`Failed to mint NFT: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}