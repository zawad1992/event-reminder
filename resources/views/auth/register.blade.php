@extends('layouts.auth')
@section('content')
<div class="card card-outline card-primary">
  <div class="card-header text-center">
    <a href="javascript:void(0);" class="h4">Register a new account</a>
  </div>
  <div class="card-body">
    <form action="{{ route('register') }}" method="post">
      @csrf

      @if($errors->has('name')) <div class="error">{{ $errors->first('name') }}</div> @endif
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="Full name" name="name" value="{{ old('name') }}">
        <div class="input-group-append"> <div class="input-group-text"> <span class="fas fa-user"></span> </div> </div>
      </div>

      @if($errors->has('email')) <div class="error">{{ $errors->first('email') }}</div> @endif
      <div class="input-group mb-3">
        <input type="email" class="form-control" placeholder="Email" name="email" value="{{ old('email') }}">
        <div class="input-group-append"> <div class="input-group-text"> <span class="fas fa-envelope"></span> </div> </div>
      </div>

      @if($errors->has('password')) <div class="error">{{ $errors->first('password') }}</div> @endif
      <div class="input-group mb-3">
        <input type="password" class="form-control" placeholder="Password" name="password">
        <div class="input-group-append"> <div class="input-group-text"> <span class="fas fa-lock"></span> </div> </div>
      </div>

      @if($errors->has('password_confirmation')) <div class="error">{{ $errors->first('password_confirmation') }}</div> @endif
      <div class="input-group mb-3">
        <input type="password" class="form-control" placeholder="Retype password" name="password_confirmation">
        <div class="input-group-append"> <div class="input-group-text"> <span class="fas fa-lock"></span> </div> </div>
      </div>
      <div class="row">
        <div class="col-8">
          <div class="icheck-primary">
            <input type="checkbox" id="agreeTerms" name="terms" value="agree">
            <label for="agreeTerms">
              I agree to the <a href="#">terms</a>
            </label>
          </div>
        </div>
        <!-- /.col -->
        <div class="col-4">
          <button type="submit" class="btn btn-primary btn-block">Register</button>
        </div>
        <!-- /.col -->
      </div>
    </form>

    <div class="social-auth-links text-center">
      <a href="#" class="btn btn-block btn-danger">
        <i class="fab fa-google mr-2"></i> Sign up using Google </a>
    </div>

    <a href="{{ route('login') }}" class="text-center">I already have an account</a>
  </div>
  <!-- /.form-box -->
</div><!-- /.card -->
@endsection
