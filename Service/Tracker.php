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
  public function build($domain, $title, $ul = false)
  {
    //$tt = $this->container->get('templating');

    /*$em = $this->container->get('doctrine.orm.entity_manager');
    $groups = array(
      'domain' => $domain,
      'title' => $title,
    );
    $menuItem = $em->getRepository('DefaultBundle:MenuGroup')->findOneBy($groups);
    $array = array(
      'ul' => $ul,
      'menus' => $menuItem->getMenu(),
    );*/

    return $this->twig->display('TrackerBundle:Tracker:Front.html.twig');
  }
}
