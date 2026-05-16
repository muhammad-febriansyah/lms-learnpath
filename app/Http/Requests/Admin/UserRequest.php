<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyPermission(['user.create', 'user.update']) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $isCreate = ! $userId;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId)->whereNull('deleted_at'),
            ],
            'username' => [
                'nullable', 'string', 'max:64', 'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId)->whereNull('deleted_at'),
            ],
            'phone' => ['nullable', 'string', 'max:32'],
            'password' => array_filter([
                $isCreate ? 'required' : 'nullable',
                'string',
                'confirmed',
                Password::min(8),
            ]),
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'status' => ['required', Rule::in(['active', 'suspended', 'banned'])],
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
            'email' => ':attribute harus berupa alamat email yang valid.',
            'unique' => ':attribute sudah digunakan.',
            'max' => ':attribute maksimal :max karakter.',
            'min' => ':attribute minimal :min karakter.',
            'confirmed' => 'Konfirmasi :attribute tidak cocok.',
            'alpha_dash' => ':attribute hanya boleh berisi huruf, angka, tanda hubung, dan underscore.',
            'exists' => ':attribute tidak valid.',
            'in' => ':attribute tidak valid.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama',
            'email' => 'Email',
            'username' => 'Username',
            'phone' => 'Nomor telepon',
            'password' => 'Password',
            'role' => 'Role',
            'status' => 'Status',
        ];
    }
}
