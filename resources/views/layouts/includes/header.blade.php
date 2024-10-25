<nav class="pl-0 ml-0 main-header navbar navbar-expand navbar-white navbar-light">
  <!-- Left navbar links -->
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a href="{{url('/events')}}" class="nav-link {{ request()->is('events') ? 'active' : '' }}">
        <i class="far fa-calendar-alt mr-2"></i> Calendar
      </a>
    </li>
    <li class="nav-item">
      <a href="{{url('/events/list')}}" class="nav-link {{ request()->is('events/list') ? 'active' : '' }}">
        <i class="fas fa-list mr-2"></i> Event List
      </a>
    </li>
  </ul>

  <!-- Center Title -->
  <div class="mx-auto">
    <h4 class="mb-0 font-weight-bold">{{ env('APP_NAME') }} </h4>
  </div>

  <!-- Right navbar links -->
  <ul class="navbar-nav ml-auto">
    <!-- Username -->
    <li class="nav-item">
      <span class="nav-link">
        <i class="fas fa-user mr-2"></i>{{ Auth::user()->name }}
      </span>
    </li>
    <!-- Notifications Dropdown Menu -->
    <li class="nav-item dropdown">
      <a class="nav-link" data-toggle="dropdown" href="#">
        <i class="far fa-bell"></i>
        <span class="badge badge-warning navbar-badge">15</span>
      </a>
      <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
        <span class="dropdown-item dropdown-header">15 Notifications</span>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fas fa-envelope mr-2"></i> 4 new messages
          <span class="float-right text-muted text-sm">3 mins</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fas fa-users mr-2"></i> 8 friend requests
          <span class="float-right text-muted text-sm">12 hours</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fas fa-file mr-2"></i> 3 new reports
          <span class="float-right text-muted text-sm">2 days</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link" data-widget="fullscreen" href="#" role="button">
        <i class="fas fa-expand-arrows-alt"></i>
      </a>
    </li>
    <!-- Logout Button -->
    <li class="nav-item">
      <a class="nav-link" href="{{ route('logout') }}" 
         onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
      <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
        @csrf
      </form>
    </li>
  </ul>
</nav>