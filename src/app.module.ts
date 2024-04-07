import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SolanaModule } from './blockchain/solana/solana.module';
import { GoogleCloudModule } from './cloud/google-cloud/google-cloud.module';
import { Arb1Service } from './blockchain/arb1/arb1.service';
import { Arb1Controller } from './blockchain/arb1/arb1.controller';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SolanaModule,
    GoogleCloudModule,
  ],
  controllers: [AppController, Arb1Controller],
  providers: [AppService, Arb1Service],
})
export class AppModule {}