<?php

namespace App\Http\Requests\Checkout;

use App\Services\Payment\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_method' => [
                'required',
                Rule::in(array_map(fn (PaymentMethod $m) => $m->value, PaymentMethod::cases())),
            ],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:32'],
            'coupon_code' => ['nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'in' => ':attribute tidak valid.',
            'email' => ':attribute harus berupa email yang valid.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'payment_method' => 'Metode pembayaran',
            'customer_name' => 'Nama',
            'customer_email' => 'Email',
            'customer_phone' => 'Nomor telepon',
            'coupon_code' => 'Kode voucher',
        ];
    }
}
