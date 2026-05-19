<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Repository;

use benmacha\mousetracker\Entity\Page;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Page>
 */
final class PageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Page::class);
    }

    /**
     * @return list<array{url: string}>
     */
    public function findDistinctUrls(?string $domain = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p.url')
            ->distinct();

        if (null !== $domain) {
            $qb->andWhere('p.domain = :domain')
                ->setParameter('domain', $domain);
        }

        return $qb->getQuery()->getArrayResult();
    }
}
