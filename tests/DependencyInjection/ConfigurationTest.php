<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\DependencyInjection;

use benmacha\mousetracker\DependencyInjection\Configuration;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\Config\Definition\Processor;

final class ConfigurationTest extends TestCase
{
    public function testDefaultsAreApplied(): void
    {
        $processed = $this->process([]);

        self::assertSame(
            [
                'record_click' => true,
                'record_move' => true,
                'record_keyboard' => true,
                'percentage_recorded' => 100,
                'ignore_ips' => [],
                'disable_mobile' => false,
            ],
            $processed
        );
    }

    public function testCustomValuesOverrideDefaults(): void
    {
        $processed = $this->process([[
            'record_keyboard' => false,
            'percentage_recorded' => 50,
            'ignore_ips' => ['10.0.0.1'],
            'disable_mobile' => true,
        ]]);

        self::assertFalse($processed['record_keyboard']);
        self::assertSame(50, $processed['percentage_recorded']);
        self::assertSame(['10.0.0.1'], $processed['ignore_ips']);
        self::assertTrue($processed['disable_mobile']);
    }

    public function testPercentageOutOfRangeIsRejected(): void
    {
        $this->expectException(InvalidConfigurationException::class);

        $this->process([['percentage_recorded' => 250]]);
    }

    /**
     * @param array<int, array<string, mixed>> $configs
     *
     * @return array<string, mixed>
     */
    private function process(array $configs): array
    {
        return (new Processor())->processConfiguration(new Configuration(), $configs);
    }
}
