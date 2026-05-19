<?php

declare(strict_types=1);

namespace benmacha\mousetracker\Entity;

use benmacha\mousetracker\Repository\PageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PageRepository::class)]
#[ORM\Table(name: 'tracker__page')]
class Page
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Client::class, inversedBy: 'pages')]
    #[ORM\JoinColumn(name: 'clientID', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private ?Client $client = null;

    #[ORM\Column(type: 'string', length: 15)]
    private string $resolution = '';

    #[ORM\Column(type: 'text')]
    private string $url = '';

    #[ORM\Column(type: 'string', length: 100)]
    private string $domain = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $source = null;

    #[ORM\Column(name: 'versionMobile', type: 'string', length: 50, nullable: true)]
    private ?string $versionMobile = null;

    /** @var Collection<int, Data> */
    #[ORM\OneToMany(mappedBy: 'page', targetEntity: Data::class, cascade: ['persist', 'remove'])]
    private Collection $data;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $date;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
        $this->data = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): self
    {
        $this->client = $client;

        return $this;
    }

    public function getResolution(): string
    {
        return $this->resolution;
    }

    public function setResolution(string $resolution): self
    {
        $this->resolution = $resolution;

        return $this;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function getDomain(): string
    {
        return $this->domain;
    }

    public function setDomain(string $domain): self
    {
        $this->domain = $domain;

        return $this;
    }

    public function getSource(): ?string
    {
        return $this->source;
    }

    public function setSource(?string $source): self
    {
        $this->source = $source;

        return $this;
    }

    public function getVersionMobile(): ?string
    {
        return $this->versionMobile;
    }

    public function setVersionMobile(?string $versionMobile): self
    {
        $this->versionMobile = $versionMobile;

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

    /** @return Collection<int, Data> */
    public function getData(): Collection
    {
        return $this->data;
    }

    public function addData(Data $data): self
    {
        if (!$this->data->contains($data)) {
            $this->data->add($data);
            $data->setPage($this);
        }

        return $this;
    }

    public function removeData(Data $data): self
    {
        $this->data->removeElement($data);

        return $this;
    }
}
