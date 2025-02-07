import { app, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { IEntityEventMessage } from "../types/IEntityEventMessage";
import axios, { AxiosResponse } from "axios";
import { IJobExecResult } from "../types/IJobExecResult";

const getClient = () => {
    const client = axios.create({
        baseURL: process.env.EZZY_COMM_JOB_API,
        timeout: 0
    });
    return client;
}

const getHeaders = (tenantCode: string) => {
    return {
        'Content-Type': 'application/json',
        'client-key': process.env.EZZY_COMM_FUNC_CLIENT_KEY,
        "client-secret": process.env.EZZY_COMM_FUNC_CLIENT_SECRET,
        "tenant-code": tenantCode
    }
}

export async function handleEntityEvent(message: IEntityEventMessage, context: InvocationContext): Promise<void> {
    let hasError = false;
    let errorMsg = "";
    try {

        const headers = getHeaders(message.tenantCode);

        const response: AxiosResponse = await getClient().get(`/api/v1/job/job-map`, { headers });
        const eventJobMap = response.data as Record<string, string[]>;
        context.log(`eventJobMap: ${JSON.stringify(eventJobMap)}`);
        let successCount = 0;
        if (eventJobMap) {
            const endpointNames = eventJobMap[message.eventName] || eventJobMap['*'];
            for (let endpointName of endpointNames) {
                try {
                    if (!endpointName.startsWith('/')) {
                        endpointName = `/${endpointName}`;
                    }
                    const response: AxiosResponse = await getClient().post(endpointName, message, { headers });
                    const execResult = response.data as IJobExecResult;

                    if (!execResult.hasError) { successCount++; }

                    context.log(`endpointName: ${endpointName}, execResult: ${JSON.stringify(execResult)}`);
                } catch (ex) {
                    context.log(`Error while executing job: ${endpointName}, error: ${ex.message}`);
                }
            }
        }
        hasError = successCount == 0 ? true : false;
        errorMsg = `successCount: ${successCount}`;
    } catch (ex) {
        hasError = true;
        errorMsg = ex.message;
    }

    const msg = {
        ...message,
        eventData: null
    };

    if (hasError) {
        context.log(`Service bus queue function processed with error with message: ${errorMsg}`, msg);
        throw new Error(errorMsg);
    } else {
        context.log(`Service bus queue function processed with success`, msg);
    }
}

app.serviceBusQueue('entity-event', {
    connection: 'SERVICEBUS_FQDN',
    queueName: process.env.QUEUE_NAME,
    handler: handleEntityEvent
});
