<?php
namespace benmacha\mousetracker\Services;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig_Environment as Environment;

class Tracker
{
  protected $container;
  protected $twig;

  /**
   * Tracker constructor.
   *
   * @param Environment $twig
   * @param ContainerInterface $container
   */
  public function __construct(Environment $twig, ContainerInterface $container)
  {
    $this->container = $container;
    $this->twig = $twig;
  }

  /**
   * @param $domain
   * @param $title
   * @param bool $ul
   */
  public function build()
  {
    return $this->twig->display('TrackerBundle:Tracker:Front.html.twig');
  }
}
