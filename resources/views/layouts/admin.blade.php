<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ (!empty($title)) ? $title : env('APP_NAME') }} </title>
  <link rel="icon" href="favicon.ico">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="{{ url('public/assets/plugins/fontawesome-free/css/all.min.css') }}">
  <link rel="stylesheet" href="{{ url('public/assets/dist/css/adminlte.min.css') }}">
  <link rel="stylesheet" href="{{ url('public/assets/plugins/jquery-confirm-v3.3.4/css/jquery-confirm.css') }}">
  <link rel="stylesheet" href="{{ url('public/assets/css/common.css') }}">

  @stack('styles')
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">
    @include('layouts/includes/header')   
    @include('layouts/includes/maincontent')
    @include('layouts/includes/footer')
</div>
<div class="overlay" style="display: none;"><i class="fas fa-cog fa-spin fa-4x"></i><p>Please wait...</p></div>

@include('layouts/includes/modal')
<script src="{{ url('public/assets/plugins/jquery/jquery.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<script src="{{ url('public/assets/plugins/jquery-confirm-v3.3.4/js/jquery-confirm.js') }}"></script>
<script src="{{ url('public/assets/dist/js/adminlte.min.js') }}"></script>
<script src="{{ url('public/assets/js/common.js') }}"></script>
<script type="text/javascript">
  var base_url = "{{url('/')}}";
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': '{{ csrf_token() }}'  // Blade syntax
    }
  });
</script>
@stack('scripts')

</body>
</html>
