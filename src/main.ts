import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BlockchainModule } from './blockchain/blockchain.module';

async function bootstrap() {
  const app = await NestFactory.create(BlockchainModule);

  const config = new DocumentBuilder()
    .setTitle('Scarif API')
    .setDescription('Scarif API')
    .setVersion('1.0')
    .addTag('Scarif')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();