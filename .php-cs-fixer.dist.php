<?php

declare(strict_types=1);

$finder = (new PhpCsFixer\Finder())
    ->in([
        __DIR__.'/Controller',
        __DIR__.'/DependencyInjection',
        __DIR__.'/Entity',
        __DIR__.'/Repository',
        __DIR__.'/Services',
        __DIR__.'/tests',
    ])
    ->append([__FILE__, __DIR__.'/TrackerBundle.php'])
    ->notPath('fixtures');

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        '@PSR12:risky' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,
        '@PHP81Migration' => true,
        '@PHP80Migration:risky' => true,
        'declare_strict_types' => true,
        'native_function_invocation' => ['include' => ['@compiler_optimized']],
        'phpdoc_to_comment' => false,
        'yoda_style' => true,
    ])
    ->setFinder($finder)
    ->setCacheFile(__DIR__.'/.php-cs-fixer.cache');
