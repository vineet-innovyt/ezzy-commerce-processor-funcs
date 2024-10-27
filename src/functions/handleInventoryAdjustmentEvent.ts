import { app, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { ProductSavedEventArg } from "../types/ProductSavedEventArg";

// const cosmosClient = new CosmosClient(process.env.DB_CON_STR);
// const db = cosmosClient.database('products');

export async function handleInventoryAdjustmentEvent(message: ProductSavedEventArg, context: InvocationContext): Promise<void> {
    context.log(`WEBSITE_SITE_NAME: ${JSON.stringify(message)}`);


    context.log('Service bus queue function processed message:', message);
}

console.log(process.env.QUEUE_NAME)
app.serviceBusQueue('handleInventoryAdjustmentEvent', {
    connection: 'kiengagebusns_SERVICEBUS',
    queueName: process.env.QUEUE_NAME,
    handler: handleInventoryAdjustmentEvent
});
