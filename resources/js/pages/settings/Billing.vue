<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import Heading from '@/components/Heading.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { portal } from '@/routes/billing';

type Props = {
    plan: string;
    subscriptionEndsAt: string | null;
    isPro: boolean;
};

const props = defineProps<Props>();

const planLabel = props.plan === 'team' ? 'Team' : props.plan === 'pro' ? 'Pro' : 'Free';
const isPaidPlan = props.plan === 'pro' || props.plan === 'team';
</script>

<template>
    <SettingsLayout>
        <Head title="Billing" />

        <h1 class="sr-only">Billing settings</h1>

        <div class="space-y-6">
            <Heading
                variant="small"
                title="Billing"
                description="Your current plan and subscription details"
            />

            <!-- Plan card -->
            <div class="rounded-lg border border-[#222] bg-[#141414] p-5">
                <div class="mb-3 flex items-start justify-between">
                    <span
                        :class="[
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            isPaidPlan
                                ? 'bg-[#e0ff4f]/10 text-[#e0ff4f]'
                                : 'bg-muted text-muted-foreground',
                        ]"
                    >
                        {{ planLabel }} Plan
                    </span>
                </div>

                <ul class="space-y-1.5 text-sm text-muted-foreground">
                    <li v-if="isPaidPlan">✦ Unlimited exports</li>
                    <li v-else>✦ Up to 10 exports per session</li>
                    <li v-if="isPaidPlan">✦ Up to 50 saved presets</li>
                    <li v-else>✦ Up to 3 saved presets</li>
                    <li v-if="isPaidPlan && subscriptionEndsAt">
                        ✦ Renews {{ subscriptionEndsAt }}
                    </li>
                </ul>
            </div>

            <div class="flex items-center gap-3">
                <Button as-child>
                    <Link :href="portal()">Manage Billing</Link>
                </Button>

                <Button v-if="!isPaidPlan" variant="outline" as-child>
                    <Link :href="portal()">Upgrade to Pro</Link>
                </Button>
            </div>
        </div>

        <Separator />

        <div class="space-y-3">
            <p class="text-xs text-muted-foreground">
                Billing is managed securely through our payment provider. You can update
                your payment method, download invoices, or cancel your subscription from
                the billing portal.
            </p>
        </div>
    </SettingsLayout>
</template>
