<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\Services;

use benmacha\mousetracker\Services\Tracker;
use PHPUnit\Framework\TestCase;
use Twig\Environment;

final class TrackerTest extends TestCase
{
    public function testBuildRendersConfiguredTemplate(): void
    {
        $twig = $this->createMock(Environment::class);
        $twig->expects(self::once())
            ->method('render')
            ->with(
                '@Tracker/Tracker/Front.html.twig',
                self::callback(static fn (array $ctx) => array_key_exists('settings', $ctx))
            )
            ->willReturn('<script>...</script>');

        $tracker = new Tracker($twig, ['record_click' => true]);

        self::assertSame('<script>...</script>', $tracker->build());
    }
}
