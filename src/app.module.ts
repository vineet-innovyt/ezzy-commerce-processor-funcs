import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductSavedEventHandler } from './handlers/productSavedEvent.handler';
import { AzServiceBus } from './services/az-servicebus';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AzServiceBus, ProductSavedEventHandler],
})
export class AppModule { }
