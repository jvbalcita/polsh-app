<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class PayMongoService
{
    private const BASE_URL = 'https://api.paymongo.com/v1';

    private function client(): PendingRequest
    {
        return Http::withBasicAuth(config('services.paymongo.secret_key'), '')
            ->acceptJson()
            ->contentType('application/json');
    }

    public function createCheckoutSession(array $attributes): array
    {
        $response = $this->client()->post(self::BASE_URL.'/checkout_sessions', [
            'data' => ['attributes' => $attributes],
        ]);

        $response->throw();

        return $response->json('data');
    }

    public function retrieveCheckoutSession(string $sessionId): array
    {
        $response = $this->client()->get(self::BASE_URL."/checkout_sessions/{$sessionId}");

        $response->throw();

        return $response->json('data');
    }

    /**
     * Create a payment intent and confirm it with an existing payment method.
     * Used for manual subscription renewals with saved card payment methods.
     */
    public function chargePaymentMethod(int $amount, string $paymentMethodId, string $description): array
    {
        // Create payment intent
        $intentResponse = $this->client()->post(self::BASE_URL.'/payment_intents', [
            'data' => [
                'attributes' => [
                    'amount' => $amount,
                    'currency' => 'PHP',
                    'payment_method_allowed' => ['card'],
                    'description' => $description,
                    'capture_type' => 'automatic',
                ],
            ],
        ]);

        $intentResponse->throw();

        $intent = $intentResponse->json('data');
        $intentId = $intent['id'];

        // Attach payment method to confirm
        $confirmResponse = $this->client()->post(self::BASE_URL."/payment_intents/{$intentId}/attach", [
            'data' => [
                'attributes' => [
                    'payment_method' => $paymentMethodId,
                    'client_key' => $intent['attributes']['client_key'],
                ],
            ],
        ]);

        $confirmResponse->throw();

        return $confirmResponse->json('data');
    }

    /**
     * Verify PayMongo webhook signature.
     * Header format: Paymongo-Signature: t=TIMESTAMP,te=HMAC_SHA256
     */
    public function verifyWebhookSignature(string $rawBody, string $signatureHeader): bool
    {
        $parts = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $value] = explode('=', $part, 2);
            $parts[$key] = $value;
        }

        if (empty($parts['t']) || empty($parts['te'])) {
            return false;
        }

        $expectedHmac = hash_hmac(
            'sha256',
            $parts['t'].'.'.$rawBody,
            config('services.paymongo.webhook_secret')
        );

        return hash_equals($expectedHmac, $parts['te']);
    }
}
