import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { OnEvent } from '@nestjs/event-emitter';
import { EventNameEnum } from 'src/enums/event-names';
import { AzServiceBus, HandlerResult } from 'src/services/az-servicebus';
import { Cron, CronExpression } from '@nestjs/schedule';

interface ProductSavedEventArg {
    id: string;
    sku: string;
    isCreate: boolean;
    isDelete: boolean
}

@Injectable()
export class ProductSavedEventHandler {


    protected logger = new Logger(EventNameEnum.PRODUCT_SAVED);

    constructor(private readonly serviceBus: AzServiceBus) {

    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async recieveMessage() {
        this.logger.debug(`${EventNameEnum.PRODUCT_SAVED} invoked`);
        try {
            await this.serviceBus.recieveMessage(EventNameEnum.PRODUCT_SAVED, async (e) => {
                return await this.handler(e.body as ProductSavedEventArg)
            });

        } catch (ex) {
            this.logger.error(`${EventNameEnum.PRODUCT_SAVED} error ${ex.message}`);
            this.logger.error(ex);

        }
    }

    async handler(eventArg: ProductSavedEventArg): Promise<HandlerResult> {
        let errorMsg = '';
        try {
            if (eventArg.isDelete) {
                throw new Error("can not process")
            }
            console.log(eventArg);

            return {
                success: true
            };
        } catch (ex) {
            this.logger.error(`${EventNameEnum.PRODUCT_SAVED} error ${ex.message}`);
            this.logger.error(ex);
            errorMsg = ex.message;
        }

        return {
            success: false,
            errorMsg
        };

    }
}