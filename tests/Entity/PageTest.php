<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Tests\Entity;

use benmacha\mousetracker\Entity\Client;
use benmacha\mousetracker\Entity\Data;
use benmacha\mousetracker\Entity\Page;
use PHPUnit\Framework\TestCase;

final class PageTest extends TestCase
{
    public function testClientAssociationIsBidirectional(): void
    {
        $client = new Client();
        $page = new Page();
        $client->addPage($page);

        self::assertSame($client, $page->getClient());
        self::assertCount(1, $client->getPages());
    }

    public function testAddDataLinksBackToPage(): void
    {
        $page = new Page();
        $data = new Data();
        $page->addData($data);

        self::assertSame($page, $data->getPage());
        self::assertCount(1, $page->getData());
    }

    public function testRemoveDataDetaches(): void
    {
        $page = new Page();
        $data = new Data();
        $page->addData($data);
        $page->removeData($data);

        self::assertCount(0, $page->getData());
    }

    public function testDefaultDateIsImmutable(): void
    {
        self::assertInstanceOf(\DateTimeImmutable::class, (new Page())->getDate());
        self::assertInstanceOf(\DateTimeImmutable::class, (new Client())->getDate());
        self::assertInstanceOf(\DateTimeImmutable::class, (new Data())->getDate());
    }
}
