<div class="container-fluid">
  <section class="my-1 py-1 content-header">
    <div class="container-fluid">
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1>{!! (!empty($title_for_layout)) ? $title_for_layout : '&nbsp;' !!}</h1>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item"><a href="{{ url('/') }}">Home</a></li>
            <li class="breadcrumb-item active">{!! (!empty($title_for_layout)) ? $title_for_layout : '&nbsp;' !!}</li>
          </ol>
        </div>
      </div>
    </div>
  </section>
  <section class="content">
    @yield('content')
  </section>
  

  {{-- <section class="content">
    <div class="card">
      <div class="card-body">
      </div>
    </div>
  </section> --}}
</div>