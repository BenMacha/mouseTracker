<?php

declare(strict_types=1);

namespace benmacha\mousetracker\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('mouse_tracker');

        $treeBuilder->getRootNode()
            ->children()
                ->booleanNode('record_click')->defaultTrue()->end()
                ->booleanNode('record_move')->defaultTrue()->end()
                ->booleanNode('record_keyboard')->defaultTrue()->end()
                ->integerNode('percentage_recorded')
                    ->min(0)->max(100)
                    ->defaultValue(100)
                ->end()
                ->arrayNode('ignore_ips')
                    ->scalarPrototype()->end()
                    ->defaultValue([])
                ->end()
                ->booleanNode('disable_mobile')->defaultFalse()->end()
            ->end();

        return $treeBuilder;
    }
}
