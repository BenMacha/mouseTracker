<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests;

use benmacha\mousetracker\DependencyInjection\MouseTrackerExtension;
use benmacha\mousetracker\TrackerBundle;
use PHPUnit\Framework\TestCase;

final class TrackerBundleTest extends TestCase
{
    public function testGetContainerExtensionReturnsMouseTrackerExtension(): void
    {
        $bundle = new TrackerBundle();

        self::assertInstanceOf(MouseTrackerExtension::class, $bundle->getContainerExtension());
    }

    public function testGetPathReturnsBundleRoot(): void
    {
        $bundle = new TrackerBundle();

        self::assertSame(\dirname(__DIR__), $bundle->getPath());
    }
}
