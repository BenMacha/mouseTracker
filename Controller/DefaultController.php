<?php

namespace System\TrackerBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use System\TrackerBundle\Entity\Client;
use System\TrackerBundle\Entity\Data;
use System\TrackerBundle\Entity\Page;

class DefaultController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        return $this->render('TrackerBundle:Default:index.html.twig');
    }

  /**
   * @Route("/createClient")
   * @Method({"POST"})
   * @param Request $request
   *
   * @return JsonResponse
   */
    public function createClientAction(Request $request)
    {
        $resolution     = $request->get('resolution');
        $token          = $request->get('token');
        $url            = $request->get('url');
        $domain         = $request->get('domain');
        $clientID       = $request->get('clientID');
        $source         = $request->get('source');
        $versionMobile  = $request->get('versionMobile');

        $em = $this->getDoctrine()->getManager();

        $client = $em->getRepository('TrackerBundle:Client')->find($clientID);
        if (!$client)
            $client = new Client();

        $client->setToken($token);
        $em->persist($client);

        $page = new Page();
        $page->setClientID($client);
        $page->setResolution($resolution);
        $page->setUrl($url);
        $page->setDomain($domain);
        $page->setSource($source);
        $page->setVersionMobile($versionMobile);

        $em->persist($page);

        $em->flush();

        return new JsonResponse(array('clientID' => $client->getId(), 'clientPageID' => $page->getId()));
    }

  /**
   * @Route("/clearPartial")
   * @Method({"POST"})
   * @param Request $request
   *
   * @return JsonResponse
   */
    public function clearPartialAction(Request $request)
    {
        return new JsonResponse(array());
    }

  /**
   * @Route("/addData")
   * @Method({"POST"})
   * @param Request $request
   *
   * @return JsonResponse
   */
    public function addDataAction(Request $request)
    {
        $movements      = $request->get('movements');
        $clicks         = $request->get('clicks');
        $partial        = $request->get('partial');
        $w              = $request->get('w');
        $clientPageID   = $request->get('clientPageID');
        $cachedRecords  = $request->get('cachedRecords');
        $record         = $request->get('record');

        $em = $this->getDoctrine()->getManager();

        $page = $em->getRepository('TrackerBundle:Page')->find($clientPageID);

        $data = new Data();
        $data->setMovements($movements);
        $data->setClicks($clicks);
        $data->setPartial($partial);
        $data->setW($w);
        $data->setClientPageID($page);
        $data->setCachedRecords($cachedRecords);
        $data->setRecord($record);

        $em->persist($data);
        $em->flush();

        return new JsonResponse(array());
    }

    /**
     * @Route("/addTag")
     * @Method({"POST"})
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function addTagAction(Request $request)
    {
        return new JsonResponse(array());
    }
}
