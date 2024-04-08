import { Controller, Get, Post, HttpException, HttpStatus, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { PredictDto } from 'src/dto/predict.dto';


@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}
  @ApiResponse({status: 200, description: 'Successfully predicted'})
  @ApiResponse({status: 201, description: 'Successfully predicted'})
  @ApiResponse({status: 500, description: 'Internal Server Error'})
  @Post('predict')
  async predict(@Body() body: PredictDto): Promise<any> {
    try {
      const { seed, prompt } = body;
      const prediction = await this.aiService.predict(seed, prompt);
      return prediction;
    } catch (error) {
      throw new HttpException(`AI prediction error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}