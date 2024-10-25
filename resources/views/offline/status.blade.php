<li class="nav-item">
    <div class="offline-status-wrapper" id="offline-status-component" style="position: relative;top: 5px;right: 0;">
        <div class="network-status">
            <span id="network-status" class="badge badge-success">ONLINE</span>
            <span id="pending-changes-count" class="badge badge-warning ml-2" style="display: none;">0</span>
        </div>
        <div id="sync-status" class="sync-status d-none">
            <div class="alert alert-warning">
                <i class="fas fa-sync-alt fa-spin mr-2"></i>
                <span class="sync-message">Syncing changes...</span>
            </div>
        </div>
    </div>
</li>
<style>
    .offline-status-wrapper{transition:.3s}.network-status{text-align:right;margin-bottom:10px}.network-status .badge{padding:8px 12px;font-size:.9rem}.sync-status{position:absolute;right:0;max-width:300px}.sync-status .alert{margin:0;padding:10px 15px;font-size:.9rem}.badge-warning{background-color:#ffc107;color:#000}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.fa-spin{animation:1s linear infinite spin}@media (max-width:768px){.network-status .badge{padding:6px 10px;font-size:.8rem}.sync-status{max-width:250px}}
</style>