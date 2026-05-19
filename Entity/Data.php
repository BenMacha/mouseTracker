<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Entity;

use benmacha\mousetracker\Repository\DataRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DataRepository::class)]
#[ORM\Table(name: 'tracker__data')]
class Data
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $movements = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $clicks = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $partial = null;

    #[ORM\Column(type: 'string', length: 25, nullable: true)]
    private ?string $w = null;

    #[ORM\Column(name: 'cachedRecords', type: 'text', nullable: true)]
    private ?string $cachedRecords = null;

    #[ORM\Column(type: 'string', length: 25, nullable: true)]
    private ?string $record = null;

    #[ORM\ManyToOne(targetEntity: Page::class, inversedBy: 'data')]
    #[ORM\JoinColumn(name: 'clientPageID', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private ?Page $page = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMovements(): ?string
    {
        return $this->movements;
    }

    public function setMovements(?string $movements): self
    {
        $this->movements = $movements;

        return $this;
    }

    public function getClicks(): ?string
    {
        return $this->clicks;
    }

    public function setClicks(?string $clicks): self
    {
        $this->clicks = $clicks;

        return $this;
    }

    public function getPartial(): ?string
    {
        return $this->partial;
    }

    public function setPartial(?string $partial): self
    {
        $this->partial = $partial;

        return $this;
    }

    public function getW(): ?string
    {
        return $this->w;
    }

    public function setW(?string $w): self
    {
        $this->w = $w;

        return $this;
    }

    public function getCachedRecords(): ?string
    {
        return $this->cachedRecords;
    }

    public function setCachedRecords(?string $cachedRecords): self
    {
        $this->cachedRecords = $cachedRecords;

        return $this;
    }

    public function getRecord(): ?string
    {
        return $this->record;
    }

    public function setRecord(?string $record): self
    {
        $this->record = $record;

        return $this;
    }

    public function getPage(): ?Page
    {
        return $this->page;
    }

    public function setPage(?Page $page): self
    {
        $this->page = $page;

        return $this;
    }

    public function getDate(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): self
    {
        $this->date = $date;

        return $this;
    }
}
