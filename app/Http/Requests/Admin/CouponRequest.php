<?php

namespace App\Http\Requests\Admin;

use App\Models\Coupon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('coupon.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;

        return [
            'code' => [
                'required', 'string', 'max:64',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('coupons', 'code')->ignore($couponId),
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'discount_type' => ['required', Rule::in([Coupon::TYPE_PERCENTAGE, Coupon::TYPE_FIXED])],
            'discount_value' => ['required', 'integer', 'min:1'],
            'max_discount' => ['nullable', 'integer', 'min:0'],
            'applicable_to' => ['required', Rule::in([Coupon::SCOPE_ALL, Coupon::SCOPE_SPECIFIC])],
            'course_ids' => ['nullable', 'array'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if ($this->input('discount_type') === Coupon::TYPE_PERCENTAGE) {
                if ((int) $this->input('discount_value') > 100) {
                    $v->errors()->add('discount_value', 'Diskon persen maksimal 100%.');
                }
            }

            if ($this->input('applicable_to') === Coupon::SCOPE_SPECIFIC
                && empty($this->input('course_ids'))
            ) {
                $v->errors()->add('course_ids', 'Pilih minimal satu kursus.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'integer' => ':attribute harus berupa angka.',
            'max' => ':attribute maksimal :max karakter.',
            'min' => ':attribute minimal :min.',
            'unique' => ':attribute sudah digunakan.',
            'in' => ':attribute tidak valid.',
            'boolean' => ':attribute harus bernilai benar atau salah.',
            'regex' => ':attribute hanya boleh berisi huruf besar, angka, tanda hubung, dan garis bawah.',
            'exists' => ':attribute tidak ditemukan.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'Kode voucher',
            'name' => 'Nama voucher',
            'discount_type' => 'Tipe diskon',
            'discount_value' => 'Nilai diskon',
            'max_discount' => 'Diskon maksimal',
            'applicable_to' => 'Scope voucher',
            'course_ids' => 'Daftar kursus',
            'max_uses' => 'Total pemakaian maksimal',
            'is_active' => 'Status aktif',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['code'] = strtoupper(trim($data['code']));
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        if (($data['applicable_to'] ?? null) === Coupon::SCOPE_ALL) {
            $data['course_ids'] = [];
        }

        if (($data['discount_type'] ?? null) === Coupon::TYPE_FIXED) {
            $data['max_discount'] = null;
        }

        return $data;
    }
}
