<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PWAController extends Controller
{
    private function getIconsConfig(): array
    {
        $sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        return array_map(function($size) {
            return [
                'src' => url("/assets/pwa/icons/icon-{$size}x{$size}.png"),
                'sizes' => "{$size}x{$size}",
                'type' => 'image/png'
            ];
        }, $sizes);
    }
    

    public function manifest(): JsonResponse
    {
        $manifest = Cache::remember('pwa-manifest', 60 * 24, function() {
            return [
                'name' => 'Event Reminder',
                'short_name' => 'Events',
                'start_url' => '/',
                'display' => 'standalone',
                'background_color' => '#ffffff',
                'theme_color' => '#007bff',
                'orientation' => 'any',
                'icons' => $this->getIconsConfig()
            ];
        });
    
        return response()->json($manifest)
            ->header('Content-Type', 'application/manifest+json');
            
    }
}