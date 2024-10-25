<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ (!empty($title)) ? $title : env('APP_NAME') }} </title>

  <!-- Add PWA meta tags -->
  <meta name="theme-color" content="#007bff">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Event Reminder">
  
  <!-- Add PWA manifest -->
  {{-- <link rel="manifest" href="{{url('assets/pwa/manifest.json')}}"> --}}
  <link rel="manifest" href="{{ route('manifest') }}">


  <link rel="icon" href="{{ asset('favicon.ico') }}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="{{ asset('assets/plugins/fontawesome-free/css/all.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/dist/css/adminlte.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/plugins/jquery-confirm-v3.3.4/css/jquery-confirm.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/css/common.css') }}">

  @stack('styles')
  
</head>
<body class="hold-transition sidebar-mini">
  <!-- Add offline status component below your header -->
<div class="wrapper">
    @include('layouts/includes/header')   
    @include('layouts/includes/maincontent')
    @include('layouts/includes/footer')
</div>
<div class="overlay" style="display: none;"><i class="fas fa-cog fa-spin fa-4x"></i><p>Please wait...</p></div>

@include('layouts/includes/modal')
<script src="{{ asset('assets/plugins/jquery/jquery.min.js') }}"></script>
<script src="{{ asset('assets/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('assets/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<script src="{{ asset('assets/plugins/jquery-confirm-v3.3.4/js/jquery-confirm.js') }}"></script>
<script src="{{ asset('assets/dist/js/adminlte.min.js') }}"></script>
<script src="{{ asset('assets/js/common.js') }}"></script>
<script type="text/javascript">
  var base_url = "{{url('/')}}";
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': '{{ csrf_token() }}'  // Blade syntax
    }
  });
</script>
@stack('scripts')


    
<script>
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Offline Manager
        const offlineManager = new OfflineManager();
        
        // Make it globally available if needed
        window.offlineManager = offlineManager;
    });
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(`${base_url}/assets/js/sw.js`)
                .then(registration => {
                    console.log('ServiceWorker registered successfully');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
</script>
<!-- Add these scripts before closing body tag -->
<script src="{{ asset('assets/js/offline/indexedDB.js') }}"></script>
<script src="{{ asset('assets/js/offline/offline-manager.js') }}"></script>
</body>
</html>
