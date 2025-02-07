export interface IEntityEventMessage {
    id?: string;
    eventName: string;
    entityId?: string;
    eventData?: Record<string, unknown>;
    tenantCode: string;
}