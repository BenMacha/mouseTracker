<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\Functional;

use benmacha\mousetracker\TrackerBundle;
use Doctrine\Bundle\DoctrineBundle\DoctrineBundle;
use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Bundle\TwigBundle\TwigBundle;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

final class TestKernel extends Kernel
{
    use MicroKernelTrait;

    public function registerBundles(): iterable
    {
        return [
            new FrameworkBundle(),
            new TwigBundle(),
            new DoctrineBundle(),
            new TrackerBundle(),
        ];
    }

    public function getProjectDir(): string
    {
        return \dirname(__DIR__, 2);
    }

    public function getCacheDir(): string
    {
        return sys_get_temp_dir().'/mousetracker_test/cache/'.$this->environment;
    }

    public function getLogDir(): string
    {
        return sys_get_temp_dir().'/mousetracker_test/log';
    }

    protected function configureContainer(ContainerConfigurator $c): void
    {
        $c->extension('framework', [
            'secret' => 'TEST',
            'test' => true,
            'router' => ['utf8' => true, 'resource' => 'kernel::loadRoutes', 'type' => 'service'],
            'http_method_override' => false,
            'handle_all_throwables' => true,
            'php_errors' => ['log' => true],
            'annotations' => false,
            'validation' => ['enabled' => false],
            'session' => null,
        ]);

        $c->extension('twig', [
            'default_path' => $this->getProjectDir().'/Resources/views',
            'strict_variables' => false,
        ]);

        $c->extension('doctrine', [
            'dbal' => [
                'driver' => 'pdo_sqlite',
                'url' => 'sqlite:///'.sys_get_temp_dir().'/mousetracker_test.sqlite',
            ],
            'orm' => [
                'auto_generate_proxy_classes' => true,
                'auto_mapping' => false,
                'mappings' => [
                    'Tracker' => [
                        'is_bundle' => false,
                        'type' => 'attribute',
                        'dir' => $this->getProjectDir().'/Entity',
                        'prefix' => 'benmacha\\mousetracker\\Entity',
                        'alias' => 'Tracker',
                    ],
                ],
            ],
        ]);
    }

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->import($this->getProjectDir().'/Resources/config/routes.yaml');
    }
}
