<?php

namespace benmacha\mousetracker\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use System\TrackerBundle\Entity\Client;
use System\TrackerBundle\Entity\Data;
use System\TrackerBundle\Entity\Page;


/**
 * Back controller.
 *
 * @Route("back")
 */
class BackController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        return $this->render('TrackerBundle:Default:index.html.twig');
    }

  /**
   * @Route("/getPages")
   * @Method({"POST"})
   * @param Request $request
   *
   * @return JsonResponse
   */
    public function getPagesAction(Request $request)
    {
        $domain = $request->get('domain');

        $em = $this->getDoctrine()->getManager();
        $pages = $em->getRepository("TrackerBundle:Page")->findDsitinct($domain);
        $array = array();

        /** @var Page $page */
        foreach ($pages as $page) {
            $array[] = $page['url'];
        }

        return new JsonResponse($array);
    }

  /**
   * @Route("/getClients")
   * @Method({"POST"})
   * @return JsonResponse
   * @internal param Request $request
   *
   */
    public function getClientsAction()
    {

        $em = $this->getDoctrine()->getManager();
        $clients = $em->getRepository("TrackerBundle:Client")->findAll();
        $array = array();

        /** @var Client $client */
        foreach ($clients as $client) {
            $array["clients"][] = array(
                'date'      => $client->getDate()->format('Y-m-d H:i:s'),
                'ip'        => '41.226.81.154',
                'resolution'=> '1606 826',
                'browser'   => 'chrome 55',
                'tags'      => '',
                'pageHistory'=> '/app_dev.php',
                'referrer'  => '',  //source page
                'timeSpent' => 100, //navigation time in second
                'id'        => $client->getId(),
                'clientid'  => $client->getId(),
                'recordid'  => $client->getId(),
                'nr'        => 1,  //number of page visited
                'token'     => '41.226.81.154#'.$client->getToken().'@chrome 55',

            );
        }


        return new JsonResponse($array);
    }

  /**
   * @Route("/getData")
   * @Method({"POST"})
   * @return JsonResponse
   * @internal param Request $request
   *
   */
    public function getDataAction()
    {

        $em = $this->getDoctrine()->getManager();
        $datas = $em->getRepository("TrackerBundle:Data")->findAll();
        $array = array();

        /** @var Data $data */
        foreach ($datas as $data) {
            foreach (json_decode($data->getPartial()) as $result)
              $array[] = $result;
        }


        return new JsonResponse($array);
    }
}
