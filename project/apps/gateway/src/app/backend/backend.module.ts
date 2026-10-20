import { Global, Module } from '@nestjs/common';
import { BackendClient } from './backend-client';
import { PresentationService } from '../presentation/presentation.service';

@Global()
@Module({
  providers: [BackendClient, PresentationService],
  exports: [BackendClient, PresentationService],
})
export class BackendModule {}
