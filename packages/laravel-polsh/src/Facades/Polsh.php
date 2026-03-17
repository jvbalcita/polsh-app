<?php

namespace Polsh\LaravelPolsh\Facades;

use Illuminate\Support\Facades\Facade;
use Polsh\LaravelPolsh\PolshClient;

/**
 * @method static string glaze(string $imageUrl, string $style, array $options = [])
 *
 * @see PolshClient
 */
class Polsh extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return PolshClient::class;
    }
}
