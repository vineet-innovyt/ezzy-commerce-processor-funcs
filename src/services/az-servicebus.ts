import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceivedMessage } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { OnEvent } from '@nestjs/event-emitter';
import { EventNameEnum } from 'src/enums/event-names';


export type HandlerResult = { success: boolean, errorMsg?: string }
export type RecevedMessageCallback = (e: ServiceBusReceivedMessage) => Promise<HandlerResult>;

@Injectable()
export class AzServiceBus {
    private readonly credential = new DefaultAzureCredential();
    // Define connection string and related Service Bus entity names here
    private readonly fqdn = process.env.SERVICEBUS_FQDN || "";

    protected logger = new Logger('AzServiceBus');

    constructor() {
    }

    protected getSbClient() {
        const sbClient = new ServiceBusClient(this.fqdn);
        return sbClient;
    }

    getQueueName(eventName: EventNameEnum) {
        const suffix = process.env.ENV == 'prod' ? '' : `-${process.env.ENV}`;
        return `${eventName}${suffix}`;
    }

    async sendMessage(eventName: EventNameEnum, data: any) {

        const queueName = this.getQueueName(eventName);
        const evName = eventName;

        this.logger.log(`AzServiceBus: ${evName} sending to ${queueName} ...`);
        const sbClient = this.getSbClient();
        const sender = sbClient.createSender(queueName);

        try {
            const msg = {
                contentType: "application/json",
                subject: eventName,
                body: data,
            };
            await sender.sendMessages(msg);

            console.log(`AzServiceBus: ${evName} Done sending, closing...`);
            await sender.close();

        } catch (err) {
            this.logger.error(`AzServiceBus:  ${evName} failed to send message`)
            this.logger.error(`AzServiceBus:  ${evName} `)
        } finally {
            await sbClient.close();
        }
    }

    async recieveMessage(eventName: EventNameEnum, callback: RecevedMessageCallback) {

        const queueName = this.getQueueName(eventName);
        const evName = eventName;

        this.logger.log(`AzServiceBus: ${evName} recieving to ${queueName} ...`);
        const sbClient = this.getSbClient();
        const receiver = sbClient.createReceiver(queueName);

        try {

            const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 30000 });
            console.log(`AzServiceBus: ${messages.length} messages received.`);
            if (messages?.length) {
                const message = messages[0];

                const handlerRes = await callback(message);

                if (handlerRes.success) {
                    await receiver.completeMessage(message);
                } else {
                    await receiver.deadLetterMessage(message, { deadLetterReason: handlerRes.errorMsg, deadLetterErrorDescription: handlerRes.errorMsg });
                }
            }
        } catch (err) {
            this.logger.error(`AzServiceBus:  ${evName} failed to receive message`)
            this.logger.error(`AzServiceBus:  ${evName} `)
            this.logger.error(err)
        } finally {
            await sbClient.close();
            await receiver.close();
        }
    }
}
