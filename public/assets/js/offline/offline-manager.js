class OfflineManager {
    async syncOfflineChanges() {
        try {
            // First check authentication status
            const authCheck = await fetch('/auth/check', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!authCheck.ok) {
                // Session expired - store current URL and redirect to login
                localStorage.setItem('post_login_sync', 'true');
                localStorage.setItem('return_url', window.location.pathname);
                window.location.href = '/login';
                return;
            }

            const changes = await this.eventDB.getSyncQueue();
            if (changes.length === 0) return;

            const response = await fetch('/offline/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ changes })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Session expired during sync - redirect to login
                    localStorage.setItem('post_login_sync', 'true');
                    localStorage.setItem('return_url', window.location.pathname);
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Sync failed');
            }

            await this.eventDB.clearSyncQueue();
            await this.refreshEvents();
            
        } catch (error) {
            console.error('Sync failed:', error);
            customAlert('Sync Failed', 'Please login again to sync changes', 'error');
        }
    }
}

// Add to your login success handler
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('post_login_sync') === 'true') {
        localStorage.removeItem('post_login_sync');
        const returnUrl = localStorage.getItem('return_url') || '/';
        localStorage.removeItem('return_url');
        
        // Initialize sync after successful login
        const offlineManager = new OfflineManager();
        offlineManager.syncOfflineChanges().then(() => {
            window.location.href = returnUrl;
        });
    }
});