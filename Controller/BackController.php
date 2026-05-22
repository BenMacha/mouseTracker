<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Controller;

use benmacha\mousetracker\Repository\ClientRepository;
use benmacha\mousetracker\Repository\PageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/back')]
final class BackController extends AbstractController
{
    public function __construct(
        private readonly ClientRepository $clientRepository,
        private readonly PageRepository $pageRepository,
    ) {
    }

    #[Route('/', name: 'mousetracker_backindex')]
    public function index(): Response
    {
        return $this->render('@Tracker/Backend/index.html.twig');
    }

    #[Route('/getPages', name: 'mousetracker_back_getPage', methods: ['POST'])]
    public function getPages(Request $request): JsonResponse
    {
        $domain = $request->request->get('domain');
        $rows = $this->pageRepository->findDistinctUrls(null !== $domain ? (string) $domain : null);

        return new JsonResponse(array_column($rows, 'url'));
    }

    #[Route('/getClients', name: 'mousetracker_back_getClient', methods: ['POST'])]
    public function getClients(): JsonResponse
    {
        $clients = $this->clientRepository->findAll();
        $payload = ['clients' => []];

        foreach ($clients as $client) {
            foreach ($client->getPages() as $page) {
                $payload['clients'][] = [
                    'date' => $page->getDate()->format('Y-m-d H:i:s'),
                    'resolution' => $page->getResolution(),
                    'browser' => '',
                    'tags' => '',
                    'pageHistory' => $page->getUrl(),
                    'referrer' => $page->getSource(),
                    'timeSpent' => 0,
                    'id' => $client->getId(),
                    'clientid' => $client->getId(),
                    'recordid' => $page->getId(),
                    'nr' => 1,
                    'token' => $client->getToken(),
                ];
            }
        }

        return new JsonResponse($payload);
    }

    #[Route('/getData', name: 'mousetracker_back_getData', methods: ['POST'])]
    public function getData(Request $request): JsonResponse
    {
        $recordId = $request->request->get('recordid');
        $page = null !== $recordId ? $this->pageRepository->find((int) $recordId) : null;

        if (null === $page) {
            return new JsonResponse([]);
        }

        $merged = [];
        foreach ($page->getData() as $data) {
            $partial = $data->getPartial();
            if (null === $partial || '' === $partial) {
                continue;
            }
            $decoded = json_decode($partial, true);
            if (is_array($decoded)) {
                $merged = array_merge($merged, $decoded);
            }
        }

        return new JsonResponse($merged);
    }
}
