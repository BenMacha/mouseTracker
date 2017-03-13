<?php

namespace benmacha\mousetracker\Controller;

use benmacha\mousetracker\Entity\Data;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;


/**
 * Back controller.
 *
 * @Route("back")
 */
class BackController extends Controller
{
    /**
     * @Route("/" ,name="mousetracker_backindex")
     */
    public function indexAction()
    {
        return $this->render('TrackerBundle:Backend:index.html.twig');
    }

  /**
   * @Route("/getPages" , name="mousetracker_back_getPage")
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
   * @Route("/getClients" , name="mousetracker_back_getClient")
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
            foreach($client->getPage() as $page){
                $array["clients"][] = array(
                  'date'      => $page->getDate()->format('Y-m-d H:i:s'),
/*                  'ip'        => '41.226.81.154',*/
                  'resolution'=> $page->getResolution(),
                  'browser'   => 'chrome 55',
                  'tags'      => '',
                  'pageHistory'=> $page->getUrl(),
                  'referrer'  => '',  //source page
                  'timeSpent' => 100, //navigation time in second
                  'id'        => $client->getId(),
                  'clientid'  => $client->getId(),
                  'recordid'  => $page->getId(),
                  'nr'        => 1,  //number of page visited
                  'token'     => '41.226.81.154#'.$client->getToken().'@chrome 55',

                );
            }

        }


        return new JsonResponse($array);
    }

  /**
   * @Route("/getData" , name="mousetracker_back_getData")
   * @Method({"POST"})
   * @return JsonResponse
   * @internal param Request $request
   *
   */
    public function getDataAction(Request $request)
    {

        $em = $this->getDoctrine()->getManager();
        $datas = $em->getRepository("TrackerBundle:Page")->find($request->get('recordid'))->getData();
        $array = array();
        /** @var Data $data */
        foreach ($datas as $data) {
          $tmp = json_decode($data->getPartial());
          for($i = 0; $i < count($tmp); $i++){
             $array[] = $tmp[$i];
          }

        }

        return new JsonResponse($array);
    }
}
