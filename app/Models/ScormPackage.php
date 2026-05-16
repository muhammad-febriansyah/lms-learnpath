<?php

namespace App\Models;

use Database\Factories\ScormPackageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'zip_path',
    'extracted_path',
    'manifest_path',
    'launch_file',
    'version',
    'status',
])]
class ScormPackage extends Model
{
    /** @use HasFactory<ScormPackageFactory> */
    use HasFactory;

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function trackings(): HasMany
    {
        return $this->hasMany(ScormTracking::class);
    }
}
