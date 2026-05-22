<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Controller;

use benmacha\mousetracker\Entity\Client;
use benmacha\mousetracker\Entity\Data;
use benmacha\mousetracker\Entity\Page;
use benmacha\mousetracker\Repository\ClientRepository;
use benmacha\mousetracker\Repository\PageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class DefaultController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ClientRepository $clientRepository,
        private readonly PageRepository $pageRepository,
    ) {
    }

    #[Route('/createClient', name: 'mousetracker_createClient', methods: ['POST'])]
    public function createClient(Request $request): JsonResponse
    {
        $clientID = $request->request->get('clientID');
        $client = null !== $clientID ? $this->clientRepository->find((int) $clientID) : null;

        if (!$client instanceof Client) {
            $client = new Client();
        }

        $client->setToken((string) $request->request->get('token', ''));
        $this->em->persist($client);

        $page = new Page();
        $page->setClient($client);
        $page->setResolution((string) $request->request->get('resolution', ''));
        $page->setUrl((string) $request->request->get('url', ''));
        $page->setDomain((string) $request->request->get('domain', ''));
        $page->setSource((string) $request->request->get('source', ''));
        $page->setVersionMobile((string) $request->request->get('versionMobile', ''));

        $this->em->persist($page);
        $this->em->flush();

        return new JsonResponse([
            'clientID' => $client->getId(),
            'clientPageID' => $page->getId(),
        ]);
    }

    #[Route('/clearPartial', name: 'mousetracker_clearPartial', methods: ['POST'])]
    public function clearPartial(Request $request): JsonResponse
    {
        return new JsonResponse([]);
    }

    #[Route('/addData', name: 'mousetracker_addData', methods: ['POST'])]
    public function addData(Request $request): JsonResponse
    {
        $clientPageID = $request->request->get('clientPageID');
        $page = null !== $clientPageID ? $this->pageRepository->find((int) $clientPageID) : null;

        if (!$page instanceof Page) {
            return new JsonResponse(['error' => 'unknown clientPageID'], 404);
        }

        $cachedRecords = $request->request->get('cachedRecords');
        $cachedRecordsStr = null !== $cachedRecords ? (string) $cachedRecords : null;

        $data = new Data();
        $data->setMovements((string) $request->request->get('movements', ''));
        $data->setClicks((string) $request->request->get('clicks', ''));
        $data->setPartial($cachedRecordsStr ?? (string) $request->request->get('partial', ''));
        $data->setW((string) $request->request->get('w', ''));
        $data->setCachedRecords($cachedRecordsStr);
        $data->setRecord((string) $request->request->get('record', ''));
        $data->setPage($page);

        $this->em->persist($data);
        $this->em->flush();

        return new JsonResponse([]);
    }

    #[Route('/addTag', name: 'mousetracker_addTag', methods: ['POST'])]
    public function addTag(Request $request): JsonResponse
    {
        return new JsonResponse([]);
    }
}
