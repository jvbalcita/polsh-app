# laravel-polsh

Official Laravel integration for [Polsh](https://polsh.app) — style your screenshots with a single method call.

## Installation

```bash
composer require polsh/laravel-polsh
```

Publish the config file:

```bash
php artisan vendor:publish --tag=polsh-config
```

## Configuration

Add your API key to `.env`:

```env
POLSH_API_KEY=pk_your_key
```

Optional environment variables and their defaults:

```env
POLSH_BASE_URL=https://polsh.app
POLSH_FORMAT=png        # png | jpeg | webp
POLSH_RESOLUTION=2      # 1 | 2 | 4
```

## Usage

### Facade

```php
use Polsh\LaravelPolsh\Facades\Polsh;

$result = Polsh::glaze('https://example.com/screenshot.png', 'obsidian-glass');
```

Pass per-request overrides as the third argument:

```php
$result = Polsh::glaze($url, 'aurora', [
    'format'     => 'webp',
    'resolution' => 4,
]);
```

**Return value:**
- Synchronous response → `data:image/png;base64,...` data URI
- Async job (HTTP 202) → status URL string for polling

### Artisan command

```bash
php artisan polsh:glaze https://example.com/screenshot.png obsidian-glass
```

Options:

```
--format=png          Output format: png, jpeg, or webp
--resolution=2        Resolution multiplier: 1, 2, or 4
--output=./out.png    Output file path
```

## Full API docs

See [https://polsh.app/docs/api](https://polsh.app/docs/api) for all available styles, options, and async polling details.
