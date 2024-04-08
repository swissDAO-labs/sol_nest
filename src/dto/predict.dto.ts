import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class PredictDto {

  @ApiProperty({
    example: 42,
    description: 'Seed for the AI prediction algorithm',
  })
  @IsNumber()
  seed: number;

  @ApiProperty({
    example: 'Peaky Blinders NFT. Faces are not directly visible. No text.',
    description: 'Prompt for the AI to generate content',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}