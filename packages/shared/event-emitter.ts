// Redis Pub/Sub event bus for inter service communication
// initEventBus(): call once at startup to connect to Redis
// publishEvent(channel, data): fire an event (noben-ai, ner-roui, adbouras use this when something happens)
// subscribeToEvents(pattern, handler): listen for events (adbouras for presence, abmahfou for analytics)
// closeEventBus(): disconnect Redis on shutdown

import Redis from 'ioredis';

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

function initEventBus(redisUrl?: string): void{
    const url = redisUrl || process.env.REDIS_URL;
    publisher = new Redis(url!);
    subscriber = new Redis(url!);
    publisher.on('connect', () => console.log('Event bus publisher connected'));
    subscriber.on('connect', () => console.log('Event bus subscriber connected'));
    publisher.on('error', (err) => console.error('Publisher error:', err.message));
    subscriber.on('error', (err) => console.error('Subscriber error:', err.message));
}

async function publishEvent(channel: string, data: unknown): Promise<void>{
    if (!publisher) { console.warn('Event bus not initialized'); return; }
    await publisher.publish(channel, JSON.stringify({ event: channel, data, timestamp: new Date().toISOString() }));
}

function subscribeToEvents(pattern: string, handler: (channel: string, data: unknown) => void): void{
    if (!subscriber) { console.warn('Event bus not initialized'); return;
    }
    subscriber.psubscribe(pattern);
    subscriber.on('pmessage', (pat, channel, message) => {
        try { handler(channel, JSON.parse(message));}
        catch (err) { console.error('Failed to parse event:', (err as Error).message);
        }
    });
}

async function closeEventBus(): Promise<void>{
    if (publisher) await publisher.quit();
    if (subscriber) await subscriber.quit();
}

export {initEventBus, publishEvent, subscribeToEvents, closeEventBus};