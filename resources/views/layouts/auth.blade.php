<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ (!empty($title)) ? $title : env('APP_NAME') }} </title>
  <link rel="icon" href="{{ asset('favicon.ico') }}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="{{ asset('assets/plugins/fontawesome-free/css/all.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/dist/css/adminlte.min.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/css/common.css') }}">


  @stack('styles')
</head>
<body class="hold-transition login-page">
<div class="login-box">
  @yield('content')
  
</div>
<!-- /.login-box -->


<script src="{{ asset('assets/plugins/jquery/jquery.min.js') }}"></script>
<script src="{{ asset('assets/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('assets/dist/js/adminlte.min.js') }}"></script>
@stack('scripts')

</body>
</html>
