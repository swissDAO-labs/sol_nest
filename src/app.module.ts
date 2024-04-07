import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SolanaModule } from './blockchain/solana/solana.module';
import { GoogleCloudModule } from './cloud/google-cloud/google-cloud.module';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SolanaModule,
    GoogleCloudModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}