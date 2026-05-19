<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\DependencyInjection;

use benmacha\mousetracker\DependencyInjection\MouseTrackerExtension;
use benmacha\mousetracker\Services\Tracker;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class MouseTrackerExtensionTest extends TestCase
{
    public function testLoadRegistersTrackerService(): void
    {
        $container = new ContainerBuilder();
        (new MouseTrackerExtension())->load([], $container);

        self::assertTrue($container->hasDefinition(Tracker::class));
        self::assertTrue($container->hasAlias('mouse_tracker'));
    }

    public function testLoadSetsConfigParameters(): void
    {
        $container = new ContainerBuilder();
        (new MouseTrackerExtension())->load([[
            'percentage_recorded' => 25,
            'ignore_ips' => ['1.2.3.4'],
        ]], $container);

        self::assertSame(25, $container->getParameter('mouse_tracker.percentage_recorded'));
        self::assertSame(['1.2.3.4'], $container->getParameter('mouse_tracker.ignore_ips'));
        self::assertTrue($container->getParameter('mouse_tracker.record_click'));
    }
}
