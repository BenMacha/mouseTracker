<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Entity;

use benmacha\mousetracker\Repository\ClientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
#[ORM\Table(name: 'tracker__client')]
class Client
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    private string $token = '';

    /** @var Collection<int, Page> */
    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Page::class, cascade: ['persist', 'remove'])]
    private Collection $pages;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
        $this->pages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

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

    /** @return Collection<int, Page> */
    public function getPages(): Collection
    {
        return $this->pages;
    }

    public function addPage(Page $page): self
    {
        if (!$this->pages->contains($page)) {
            $this->pages->add($page);
            $page->setClient($this);
        }

        return $this;
    }

    public function removePage(Page $page): self
    {
        $this->pages->removeElement($page);

        return $this;
    }
}
