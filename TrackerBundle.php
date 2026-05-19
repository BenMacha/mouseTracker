<?php

declare(strict_types=1);

namespace benmacha\mousetracker;

use benmacha\mousetracker\DependencyInjection\MouseTrackerExtension;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;

final class TrackerBundle extends Bundle
{
    public function getContainerExtension(): ?ExtensionInterface
    {
        if (null === $this->extension) {
            $this->extension = new MouseTrackerExtension();
        }

        return $this->extension ?: null;
    }

    public function getPath(): string
    {
        return __DIR__;
    }
}
