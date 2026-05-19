<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Services;

use Twig\Environment;

final class Tracker
{
    /**
     * @param array<string, mixed> $settings
     */
    public function __construct(
        private readonly Environment $twig,
        private readonly array $settings = [],
    ) {
    }

    public function build(): string
    {
        return $this->twig->render('@Tracker/Tracker/Front.html.twig', [
            'settings' => $this->settings,
        ]);
    }
}
