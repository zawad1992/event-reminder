@extends('layouts.auth')

@section('content')
<!-- /.login-logo -->
<div class="card card-outline card-primary">
  <div class="card-header text-center">
    <a href="javascript:void(0);" class="h4">Sign in</a>
  </div>
  <div class="card-body">
    <form action="{{ route('login') }}" method="post">
      @csrf

      @if($errors->has('email')) <div class="error">{{ $errors->first('email') }}</div> @endif
      <div class="input-group mb-3">
        <input type="email" name="email" class="form-control" placeholder="Email">
        <div class="input-group-append">
          <div class="input-group-text">
            <span class="fas fa-envelope"></span>
          </div>
        </div>
      </div>

      @if($errors->has('password')) <div class="error">{{ $errors->first('password') }}</div> @endif
      <div class="input-group mb-3">
        <input type="password" name="password" class="form-control" placeholder="Password">
        <div class="input-group-append">
          <div class="input-group-text">
            <span class="fas fa-lock"></span>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-8">
          <div class="icheck-primary">
            <input type="checkbox" name="remember" id="remember">
            <label for="remember">
              Remember Me
            </label>
          </div>
        </div>
        <div class="col-4">
          <button type="submit" class="btn btn-primary btn-block">Sign In</button>
        </div>
      </div>
    </form>

    {{-- <div class="social-auth-links text-center mt-2 mb-3">
      <a href="#" class="btn btn-block btn-danger">
        <i class="fab fa-google mr-2"></i> Sign in using Google
      </a>
    </div>

    <p class="mb-1">
      <a href="{{ route('password.request') }}">I forgot my password</a>
    </p> --}}
    <p class="mb-0">
      <a href="{{ route('register') }}" class="text-center">Register a new account</a>
    </p>
  </div>
</div>
@endsection
