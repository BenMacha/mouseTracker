<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\Functional;

use benmacha\mousetracker\Entity\Client;
use benmacha\mousetracker\Entity\Data;
use benmacha\mousetracker\Entity\Page;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpKernel\Kernel;

/**
 * End-to-end contract tests: the same JSON fixtures used by the JS suite
 * (tests/fixtures/*.json) are POSTed to the actual Symfony controllers,
 * which means a regression in either side breaks a real test.
 */
final class IngestEndpointsTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $em;

    protected static function getKernelClass(): string
    {
        return TestKernel::class;
    }

    /** @var list<callable> */
    private array $errorHandlersAtSetUp = [];
    /** @var list<callable> */
    private array $exceptionHandlersAtSetUp = [];

    protected function setUp(): void
    {
        if (Kernel::VERSION_ID < 60100) {
            self::markTestSkipped('Bundle routes.yaml uses Routing `type: attribute`, added in Symfony 6.1.');
        }

        $this->errorHandlersAtSetUp = self::snapshotErrorHandlers();
        $this->exceptionHandlersAtSetUp = self::snapshotExceptionHandlers();

        $this->client = static::createClient(['environment' => 'test', 'debug' => false]);
        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get('doctrine.orm.entity_manager');
        $this->em = $em;

        $metadata = $em->getMetadataFactory()->getAllMetadata();
        $tool = new SchemaTool($em);
        $tool->dropSchema($metadata);
        $tool->createSchema($metadata);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        // Symfony's HttpKernel pushes error/exception handlers during boot,
        // request handling, and shutdown that it does not pop. PHPUnit flags
        // the resulting stack drift as risky, so we restore the snapshot
        // taken in setUp.
        $current = \count(self::snapshotErrorHandlers());
        while ($current > \count($this->errorHandlersAtSetUp)) {
            restore_error_handler();
            --$current;
        }
        $current = \count(self::snapshotExceptionHandlers());
        while ($current > \count($this->exceptionHandlersAtSetUp)) {
            restore_exception_handler();
            --$current;
        }
    }

    /** @return list<callable> */
    private static function snapshotErrorHandlers(): array
    {
        $handlers = [];
        while (true) {
            $previous = set_error_handler(static fn () => false);
            restore_error_handler();
            if (null === $previous) {
                break;
            }
            $handlers[] = $previous;
            restore_error_handler();
        }
        foreach (array_reverse($handlers) as $h) {
            set_error_handler($h);
        }

        return $handlers;
    }

    /** @return list<callable> */
    private static function snapshotExceptionHandlers(): array
    {
        $handlers = [];
        while (true) {
            $previous = set_exception_handler(static fn () => null);
            restore_exception_handler();
            if (null === $previous) {
                break;
            }
            $handlers[] = $previous;
            restore_exception_handler();
        }
        foreach (array_reverse($handlers) as $h) {
            set_exception_handler($h);
        }

        return $handlers;
    }

    public function testCreateClientAcceptsTrackerJsPayload(): void
    {
        $payload = $this->loadFixture('createClientPayload.json');

        $this->client->request('POST', '/tracker/createClient', $payload);

        self::assertResponseIsSuccessful();
        $response = json_decode((string) $this->client->getResponse()->getContent(), true);

        self::assertIsArray($response);
        self::assertArrayHasKey('clientID', $response);
        self::assertArrayHasKey('clientPageID', $response);
        self::assertIsInt($response['clientID']);
        self::assertIsInt($response['clientPageID']);

        $client = $this->em->getRepository(Client::class)->find($response['clientID']);
        self::assertNotNull($client);
        self::assertSame($payload['token'], $client->getToken());

        $page = $this->em->getRepository(Page::class)->find($response['clientPageID']);
        self::assertNotNull($page);
        self::assertSame($payload['url'], $page->getUrl());
        self::assertSame($payload['domain'], $page->getDomain());
        self::assertSame($payload['resolution'], $page->getResolution());
        self::assertSame($client->getId(), $page->getClient()?->getId());
    }

    public function testAddDataPersistsRowForExistingPage(): void
    {
        $createPayload = $this->loadFixture('createClientPayload.json');
        $this->client->request('POST', '/tracker/createClient', $createPayload);
        $created = json_decode((string) $this->client->getResponse()->getContent(), true);

        $addData = $this->loadFixture('addDataPayload.json');
        $addData['clientPageID'] = (string) $created['clientPageID'];

        $this->client->request('POST', '/tracker/addData', $addData);

        self::assertResponseIsSuccessful();

        $rows = $this->em->getRepository(Data::class)->findAll();
        self::assertCount(1, $rows);
        $row = $rows[0];
        self::assertSame($addData['movements'], $row->getMovements());
        self::assertSame($addData['clicks'], $row->getClicks());
        self::assertSame($addData['partial'], $row->getPartial());
        self::assertSame($created['clientPageID'], $row->getPage()?->getId());
    }

    public function testAddDataRejectsUnknownPage(): void
    {
        $addData = $this->loadFixture('addDataPayload.json');
        $addData['clientPageID'] = '999999';

        $this->client->request('POST', '/tracker/addData', $addData);

        self::assertResponseStatusCodeSame(404);
    }

    public function testClearPartialAndAddTagReturnEmptyJson(): void
    {
        $this->client->request('POST', '/tracker/clearPartial', ['clientPageID' => '1']);
        self::assertResponseIsSuccessful();
        self::assertJsonStringEqualsJsonString('[]', (string) $this->client->getResponse()->getContent());

        $this->client->request('POST', '/tracker/addTag', ['clientID' => '1', 'tagContent' => 'checkout']);
        self::assertResponseIsSuccessful();
        self::assertJsonStringEqualsJsonString('[]', (string) $this->client->getResponse()->getContent());
    }

    /**
     * @return array<string, mixed>
     */
    private function loadFixture(string $name): array
    {
        $raw = file_get_contents(\dirname(__DIR__).'/fixtures/'.$name);
        self::assertNotFalse($raw, "fixture {$name} missing");

        $data = json_decode($raw, true);
        self::assertIsArray($data);

        // Drop null entries — tracker.js's post() helper strips null/undefined
        // before sending, so the controllers never see them.
        return array_filter($data, static fn ($v) => null !== $v);
    }
}
