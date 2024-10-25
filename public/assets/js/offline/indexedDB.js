class EventDB {
    constructor() {
        this.dbName = 'EventReminderDB';
        this.dbVersion = 1;
        this.eventsStore = 'events';
        this.syncQueue = 'syncQueue';
        this.init();
    }

    async init() {
        if (!window.indexedDB) {
            console.error("Your browser doesn't support IndexedDB");
            return;
        }

        try {
            this.db = await this.openDB();
            console.log('IndexedDB initialized successfully');
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
        }
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create events store
                if (!db.objectStoreNames.contains(this.eventsStore)) {
                    const eventStore = db.createObjectStore(this.eventsStore, { keyPath: 'offline_id' });
                    eventStore.createIndex('id', 'id', { unique: false });
                    eventStore.createIndex('sync_status', 'sync_status');
                    eventStore.createIndex('created_at', 'created_at');
                }

                // Create sync queue store
                if (!db.objectStoreNames.contains(this.syncQueue)) {
                    const syncStore = db.createObjectStore(this.syncQueue, { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('type', 'type');
                    syncStore.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }

    async addEvent(event) {
        const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const eventData = {
            ...event,
            offline_id: offlineId,
            sync_status: 'pending',
            created_at: new Date().toISOString()
        };

        const db = await this.openDB();
        const tx = db.transaction([this.eventsStore, this.syncQueue], 'readwrite');
        
        await Promise.all([
            // Store the event
            tx.objectStore(this.eventsStore).add(eventData),
            
            // Add to sync queue
            tx.objectStore(this.syncQueue).add({
                type: 'create',
                data: eventData,
                timestamp: Date.now()
            })
        ]);

        return eventData;
    }

    async updateEvent(event) {
        const db = await this.openDB();
        const tx = db.transaction([this.eventsStore, this.syncQueue], 'readwrite');

        const eventData = {
            ...event,
            sync_status: 'pending',
            updated_at: new Date().toISOString()
        };

        await Promise.all([
            // Update the event
            tx.objectStore(this.eventsStore).put(eventData),
            
            // Add to sync queue
            tx.objectStore(this.syncQueue).add({
                type: 'update',
                data: eventData,
                timestamp: Date.now()
            })
        ]);

        return eventData;
    }

    async deleteEvent(eventId) {
        const db = await this.openDB();
        const tx = db.transaction([this.eventsStore, this.syncQueue], 'readwrite');

        await Promise.all([
            // Delete the event
            tx.objectStore(this.eventsStore).delete(eventId),
            
            // Add to sync queue
            tx.objectStore(this.syncQueue).add({
                type: 'delete',
                data: { id: eventId },
                timestamp: Date.now()
            })
        ]);

        return true;
    }

    async getEvent(offlineId) {
        const db = await this.openDB();
        const tx = db.transaction(this.eventsStore, 'readonly');
        return tx.objectStore(this.eventsStore).get(offlineId);
    }

    async getAllEvents() {
        const db = await this.openDB();
        const tx = db.transaction(this.eventsStore, 'readonly');
        return tx.objectStore(this.eventsStore).getAll();
    }

    async getSyncQueue() {
        const db = await this.openDB();
        const tx = db.transaction(this.syncQueue, 'readonly');
        return tx.objectStore(this.syncQueue).getAll();
    }

    async clearSyncQueue() {
        const db = await this.openDB();
        const tx = db.transaction(this.syncQueue, 'readwrite');
        await tx.objectStore(this.syncQueue).clear();
        return true;
    }

    async getPendingChangesCount() {
        const db = await this.openDB();
        const tx = db.transaction(this.syncQueue, 'readonly');
        const store = tx.objectStore(this.syncQueue);
        return store.count();
    }
}