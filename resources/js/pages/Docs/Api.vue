<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import ProductPageHeader from '@/components/ProductPageHeader.vue';
import { editor } from '@/routes';
import { index as apiKeys } from '@/routes/api-keys';

const activeTab = ref<'curl' | 'php' | 'node' | 'python'>('curl');

const STYLES = [
    'obsidian-glass', 'neon-halo', 'arctic-white', 'terminal-dark',
    'sakura-mesh', 'aurora', 'product-hunt', 'og-minimal',
    'grid-light', 'dark-studio', 'browser-light', 'browser-dark',
    'warm-studio', 'cyber-pink', 'slate-card', 'forest-dark',
    'paper-white', 'retro-amber',
];

const curlExample = `curl -X POST https://polsh.work/api/v1/polish \\
  -H "Authorization: Bearer pk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/screenshot.png",
    "style": "obsidian-glass",
    "format": "png",
    "resolution": 2,
    "aspect_ratio": "16:9"
  }' \\
  --output polished.png`;

const phpExample = `<?php
$response = Http::withToken('pk_your_api_key')
    ->post('https://polsh.work/api/v1/polish', [
        'image_url'  => 'https://example.com/screenshot.png',
        'style'      => 'obsidian-glass',
        'format'     => 'png',
        'resolution' => 2,
    ]);

file_put_contents('polished.png', $response->body());`;

const nodeExample = `import fs from 'fs';

const res = await fetch('https://polsh.work/api/v1/polish', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pk_your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image_url: 'https://example.com/screenshot.png',
    style: 'obsidian-glass',
    format: 'png',
    resolution: 2,
  }),
});

const buffer = Buffer.from(await res.arrayBuffer());
fs.writeFileSync('polished.png', buffer);`;

const pythonExample = `import requests

res = requests.post(
    'https://polsh.work/api/v1/polish',
    headers={'Authorization': 'Bearer pk_your_api_key'},
    json={
        'image_url': 'https://example.com/screenshot.png',
        'style': 'obsidian-glass',
        'format': 'png',
        'resolution': 2,
    },
)

with open('polished.png', 'wb') as f:
    f.write(res.content)`;

const asyncExample = `# 1. Dispatch 4× job
curl -X POST https://polsh.work/api/v1/polish \\
  -H "Authorization: Bearer pk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "...", "style": "aurora", "resolution": 4}'
# → 202 {"job_id": "uuid", "status": "pending", "status_url": "..."}

# 2. Poll for completion
curl https://polsh.work/api/v1/polish/status/{job_id} \\
  -H "Authorization: Bearer pk_your_api_key"
# → {"status": "done", "url": "https://..."}`;

const codeExamples: Record<string, string> = {
    curl: curlExample,
    php: phpExample,
    node: nodeExample,
    python: pythonExample,
};
</script>

<template>
    <Head title="API Docs — Polsh" />

    <div class="min-h-screen" style="background: #080808">
        <ProductPageHeader
            context="/ docs / api"
            :home-href="editor()"
            :trailing-href="apiKeys()"
            trailing-label="Manage keys →"
            trailing-variant="link"
        />

        <div class="mx-auto max-w-3xl px-6 py-12">
            <!-- Title -->
            <h1 class="mb-2 text-2xl font-semibold tracking-tight text-white/85">REST API</h1>
            <p class="mb-10 text-sm text-white/40">
                Apply any Polsh style to a screenshot programmatically. Requires a Pro subscription and an API key.
            </p>

            <!-- Authentication -->
            <section class="mb-10">
                <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Authentication</h2>
                <div class="polsh-panel rounded-xl border border-white/8 p-5">
                    <p class="mb-3 text-[13px] text-white/60">
                        Pass your API key in the <code class="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-[#e0ff4f]/80">Authorization</code> header:
                    </p>
                    <pre class="overflow-x-auto rounded border border-white/8 p-3 font-mono text-[11px] text-white/50" style="background: rgba(0,0,0,0.5)">Authorization: Bearer pk_your_api_key</pre>
                    <p class="mt-3 text-[11px] text-white/30">
                        Generate keys at
                        <Link :href="apiKeys()" class="text-[#e0ff4f]/60 hover:text-[#e0ff4f] transition-colors">/dashboard/api-keys</Link>.
                        Keys are shown only once on creation.
                    </p>
                </div>
            </section>

            <!-- Rate limits -->
            <section class="mb-10">
                <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Rate limits</h2>
                <div class="polsh-panel rounded-xl border border-white/8 overflow-hidden">
                    <div class="grid grid-cols-3 border-b border-white/6 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                        <span>Plan</span><span>Limit</span><span>Reset</span>
                    </div>
                    <div class="grid grid-cols-3 border-b border-white/5 px-5 py-3 text-[12px]">
                        <span class="text-white/60">Pro</span>
                        <span class="text-white/60">500 / day</span>
                        <span class="text-white/35">Midnight UTC</span>
                    </div>
                    <div class="grid grid-cols-3 px-5 py-3 text-[12px]">
                        <span class="text-white/60">Pro + Team</span>
                        <span class="text-white/60">5,000 / day</span>
                        <span class="text-white/35">Midnight UTC</span>
                    </div>
                </div>
                <p class="mt-2 text-[11px] text-white/30">
                    When exceeded, the API returns <code class="font-mono text-white/50">429</code> with a
                    <code class="font-mono text-white/50">Retry-After</code> header.
                </p>
            </section>

            <!-- POST /api/v1/polish -->
            <section class="mb-10">
                <div class="mb-3 flex items-center gap-3">
                    <span class="rounded bg-[#e0ff4f]/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#e0ff4f]">POST</span>
                    <code class="font-mono text-[13px] text-white/60">/api/v1/polish</code>
                </div>
                <p class="mb-4 text-[13px] text-white/45">Apply a style to an image. Returns the processed image as binary for 1×/2×, or a job ID for 4×.</p>

                <!-- Request params -->
                <div class="polsh-panel mb-5 rounded-xl border border-white/8 overflow-hidden">
                    <div class="border-b border-white/6 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                        Request body (JSON)
                    </div>
                    <table class="w-full text-[12px]">
                        <tbody>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-[#e0ff4f]/70">image_url</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">required</td>
                                <td class="px-3 py-2.5 text-white/50">URL of the source image (PNG, JPEG, WebP)</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-[#e0ff4f]/70">style</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">required</td>
                                <td class="px-3 py-2.5 text-white/50">Style slug — see list below</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">format</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50"><code class="font-mono text-[10px]">png</code> · <code class="font-mono text-[10px]">jpeg</code> · <code class="font-mono text-[10px]">webp</code> (default: png)</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">resolution</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50"><code class="font-mono text-[10px]">1</code> · <code class="font-mono text-[10px]">2</code> · <code class="font-mono text-[10px]">4</code> (default: 1). 4× is async.</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">aspect_ratio</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50"><code class="font-mono text-[10px]">16:9</code> · <code class="font-mono text-[10px]">4:3</code> · <code class="font-mono text-[10px]">1:1</code> · <code class="font-mono text-[10px]">3:2</code> · <code class="font-mono text-[10px]">21:9</code></td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">padding</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50">Canvas padding in px (0–240). Overrides style default.</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">radius</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50">Corner radius in px (0–80). Overrides style default.</td>
                            </tr>
                            <tr class="border-b border-white/5">
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">shadow_opacity</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50">Shadow opacity (0.0–1.0)</td>
                            </tr>
                            <tr>
                                <td class="px-5 py-2.5 font-mono text-[11px] text-white/40">border_width</td>
                                <td class="px-3 py-2.5 text-white/35 text-[10px]">optional</td>
                                <td class="px-3 py-2.5 text-white/50">Border width in px (0–8)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Response -->
                <div class="polsh-panel mb-5 rounded-xl border border-white/8 overflow-hidden">
                    <div class="border-b border-white/6 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                        Response
                    </div>
                    <div class="divide-y divide-white/5">
                        <div class="flex items-start gap-3 px-5 py-3">
                            <code class="shrink-0 rounded bg-green-500/10 px-1.5 py-0.5 font-mono text-[10px] text-green-400">200</code>
                            <p class="text-[12px] text-white/50">Image binary with <code class="font-mono text-[10px]">Content-Type: image/png</code> (1×/2× sync)</p>
                        </div>
                        <div class="flex items-start gap-3 px-5 py-3">
                            <code class="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">202</code>
                            <p class="text-[12px] text-white/50">
                                <code class="font-mono text-[10px]">{"job_id": "uuid", "status": "pending", "status_url": "..."}</code> (4× async)
                            </p>
                        </div>
                        <div class="flex items-start gap-3 px-5 py-3">
                            <code class="shrink-0 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-400">422</code>
                            <p class="text-[12px] text-white/50">Validation error or unprocessable image</p>
                        </div>
                        <div class="flex items-start gap-3 px-5 py-3">
                            <code class="shrink-0 rounded bg-orange-500/10 px-1.5 py-0.5 font-mono text-[10px] text-orange-400">429</code>
                            <p class="text-[12px] text-white/50">Rate limit exceeded — check <code class="font-mono text-[10px]">Retry-After</code> header</p>
                        </div>
                    </div>
                </div>

                <!-- Code examples -->
                <div class="polsh-panel rounded-xl border border-white/8 overflow-hidden">
                    <!-- Tab bar -->
                    <div class="flex border-b border-white/6">
                        <button
                            v-for="tab in (['curl', 'php', 'node', 'python'] as const)"
                            :key="tab"
                            type="button"
                            class="px-4 py-2 text-[11px] font-medium transition-colors"
                            :class="activeTab === tab
                                ? 'text-[#e0ff4f] border-b border-[#e0ff4f]'
                                : 'text-white/35 hover:text-white/60'"
                            @click="activeTab = tab"
                        >
                            {{ tab === 'node' ? 'Node.js' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
                        </button>
                    </div>
                    <pre class="overflow-x-auto p-5 font-mono text-[11px] leading-relaxed text-white/55" style="background: rgba(0,0,0,0.4)">{{ codeExamples[activeTab] }}</pre>
                </div>
            </section>

            <!-- GET /api/v1/polish/status/{job_id} -->
            <section class="mb-10">
                <div class="mb-3 flex items-center gap-3">
                    <span class="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-blue-400">GET</span>
                    <code class="font-mono text-[13px] text-white/60">/api/v1/polish/status/{'{'}job_id{'}'}</code>
                </div>
                <p class="mb-4 text-[13px] text-white/45">Check the status of a 4× async job. Poll until <code class="font-mono text-[11px] text-white/60">status</code> is <code class="font-mono text-[11px] text-white/60">done</code> or <code class="font-mono text-[11px] text-white/60">failed</code>.</p>

                <div class="polsh-panel mb-4 rounded-xl border border-white/8 overflow-hidden">
                    <div class="border-b border-white/6 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">Response</div>
                    <div class="divide-y divide-white/5">
                        <div class="px-5 py-3">
                            <p class="font-mono text-[11px] text-white/50">
                                {"status": "pending"}
                            </p>
                        </div>
                        <div class="px-5 py-3">
                            <p class="font-mono text-[11px] text-white/50">
                                {"status": "done", "url": "https://..."}
                            </p>
                        </div>
                        <div class="px-5 py-3">
                            <p class="font-mono text-[11px] text-white/50">
                                {"status": "failed", "message": "..."}
                            </p>
                        </div>
                    </div>
                </div>

                <pre class="overflow-x-auto rounded-xl border border-white/8 p-5 font-mono text-[11px] leading-relaxed text-white/55" style="background: rgba(0,0,0,0.5)">{{ asyncExample }}</pre>
            </section>

            <!-- Styles -->
            <section class="mb-10">
                <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Available styles</h2>
                <div class="flex flex-wrap gap-2">
                    <code
                        v-for="slug in STYLES"
                        :key="slug"
                        class="rounded border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/50"
                        style="background: rgba(255,255,255,0.04)"
                    >{{ slug }}</code>
                </div>
            </section>

            <!-- Webhooks -->
            <section class="mb-10">
                <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Webhooks</h2>
                <div class="polsh-panel rounded-xl border border-white/8 p-5 space-y-4">
                    <p class="text-[13px] text-white/60">
                        For 4× resolution jobs (async), set a <code class="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-[#e0ff4f]/80">webhook_url</code>
                        on your API key. Polsh will POST to that URL when the job completes.
                    </p>
                    <div>
                        <p class="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/25">Payload</p>
                        <pre class="overflow-x-auto rounded border border-white/8 p-3 font-mono text-[11px] text-white/50" style="background: rgba(0,0,0,0.5)">{
  "event":     "glaze.complete",
  "url":       "https://cdn.polsh.work/polished/uuid.png",
  "style":     "obsidian-glass",
  "format":    "png",
  "job_id":    "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-18T10:00:00.000000Z"
}</pre>
                    </div>
                    <p class="text-[11px] text-white/30">
                        Configure your webhook URL when creating an API key at
                        <Link :href="apiKeys()" class="text-[#e0ff4f]/60 hover:text-[#e0ff4f] transition-colors">/dashboard/api-keys</Link>.
                    </p>
                </div>
            </section>
        </div>
    </div>
</template>
