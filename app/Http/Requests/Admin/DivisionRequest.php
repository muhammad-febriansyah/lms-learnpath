<?php

namespace App\Http\Requests\Admin;

use App\Support\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DivisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('division.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tenantId = app(TenantManager::class)->id();
        $divisionId = $this->route('division')?->id;

        return [
            'name' => [
                'required', 'string', 'max:150',
                Rule::unique('divisions', 'name')
                    ->where(fn ($q) => $q->where('tenant_id', $tenantId))
                    ->ignore($divisionId),
            ],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'boolean' => ':attribute harus bernilai benar atau salah.',
            'name.unique' => 'Divisi dengan nama tersebut sudah ada.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama divisi',
            'code' => 'Kode',
            'description' => 'Deskripsi',
            'is_active' => 'Status aktif',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        return $data;
    }
}
