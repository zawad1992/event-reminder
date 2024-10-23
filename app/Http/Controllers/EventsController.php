<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EventsController extends Controller
{
    //

    public function index()
    {
        $title = 'Events';
        $title_for_layout = 'Events List';
        return view('events.index', compact('title', 'title_for_layout'));
    }
}
