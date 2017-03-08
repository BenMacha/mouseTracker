<?php

namespace System\TrackerBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * PageRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class PageRepository extends EntityRepository
{


    public function findDsitinct($domain = null)
    {

        $qb = $this->createQueryBuilder("p");

        return  $qb->select("p.url")
          ->distinct(true)
          ->getQuery()
          ->getResult();
    }
}
