<?php

declare(strict_types=1);

namespace benmacha\mousetracker\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

final class MouseTrackerExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $container->setParameter('mouse_tracker.record_click', $config['record_click']);
        $container->setParameter('mouse_tracker.record_move', $config['record_move']);
        $container->setParameter('mouse_tracker.record_keyboard', $config['record_keyboard']);
        $container->setParameter('mouse_tracker.percentage_recorded', $config['percentage_recorded']);
        $container->setParameter('mouse_tracker.ignore_ips', $config['ignore_ips']);
        $container->setParameter('mouse_tracker.disable_mobile', $config['disable_mobile']);

        $loader = new YamlFileLoader(
            $container,
            new FileLocator(__DIR__.'/../Resources/config')
        );
        $loader->load('services.yaml');
    }

    public function getAlias(): string
    {
        return 'mouse_tracker';
    }
}
