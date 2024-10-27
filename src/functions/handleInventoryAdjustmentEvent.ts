import { app, InvocationContext } from "@azure/functions";

export async function handleInventoryAdjustmentEvent(message: unknown, context: InvocationContext): Promise<void> {
    context.log(`WEBSITE_SITE_NAME: ${process.env["GRS"]}`);
    context.log('Service bus queue function processed message:', message);
}

app.serviceBusQueue('handleInventoryAdjustmentEvent', {
    connection: 'kiengagebusns_SERVICEBUS',
    queueName: 'inventory-adjustments-dev',
    handler: handleInventoryAdjustmentEvent
});
