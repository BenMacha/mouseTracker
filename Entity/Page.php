<?php

namespace benmacha\mousetracker\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Page
 *
 * @ORM\Table(name="tracker__page")
 * @ORM\Entity(repositoryClass="\benmacha\mousetracker\Repository\PageRepository")
 */
class Page
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Client", inversedBy="page")
     * @ORM\JoinColumn(name="clientID", referencedColumnName="id", onDelete="CASCADE",)
     */
    private $clientID;

    /**
     * @var string
     *
     * @ORM\Column(name="resolution", type="string", length=15)
     */
    private $resolution;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="text")
     */
    private $url;

    /**
     * @var string
     *
     * @ORM\Column(name="domain", type="string", length=50)
     */
    private $domain;

    /**
     * @var string
     *
     * @ORM\Column(name="source", type="string", length=50)
     */
    private $source;

    /**
     * @var string
     *
     * @ORM\Column(name="versionMobile", type="string", length=50)
     */
    private $versionMobile;

    /**
     * @ORM\OneToMany(targetEntity="Data", mappedBy="clientPageID", cascade={"persist", "remove"})
     */
    private $data;

  /**
   * @var \DateTime
   *
   * @ORM\Column(name="date", type="datetime")
   */
  private $date;

    /**
     * Data constructor.
     */
    public function __construct()
    {
        $this->date = new \DateTime();
        $this->data = new \Doctrine\Common\Collections\ArrayCollection();
    }


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set resolution
     *
     * @param string $resolution
     * @return Page
     */
    public function setResolution($resolution)
    {
        $this->resolution = $resolution;

        return $this;
    }

    /**
     * Get resolution
     *
     * @return string 
     */
    public function getResolution()
    {
        return $this->resolution;
    }

    /**
     * Set url
     *
     * @param string $url
     * @return Page
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string 
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set domain
     *
     * @param string $domain
     * @return Page
     */
    public function setDomain($domain)
    {
        $this->domain = $domain;

        return $this;
    }

    /**
     * Get domain
     *
     * @return string 
     */
    public function getDomain()
    {
        return $this->domain;
    }

    /**
     * Set source
     *
     * @param string $source
     * @return Page
     */
    public function setSource($source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source
     *
     * @return string 
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Set versionMobile
     *
     * @param string $versionMobile
     * @return Page
     */
    public function setVersionMobile($versionMobile)
    {
        $this->versionMobile = $versionMobile;

        return $this;
    }

    /**
     * Get versionMobile
     *
     * @return string 
     */
    public function getVersionMobile()
    {
        return $this->versionMobile;
    }

    /**
     * Set date
     *
     * @param \DateTime $date
     * @return Page
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime 
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set clientID
     *
     * @param \System\TrackerBundle\Entity\Client $clientID
     * @return Page
     */
    public function setClientID(\System\TrackerBundle\Entity\Client $clientID = null)
    {
        $this->clientID = $clientID;

        return $this;
    }

    /**
     * Get clientID
     *
     * @return \System\TrackerBundle\Entity\Client 
     */
    public function getClientID()
    {
        return $this->clientID;
    }

    /**
     * Add data
     *
     * @param \System\TrackerBundle\Entity\Data $data
     * @return Page
     */
    public function addDatum(\System\TrackerBundle\Entity\Data $data)
    {
        $this->data[] = $data;

        return $this;
    }

    /**
     * Remove data
     *
     * @param \System\TrackerBundle\Entity\Data $data
     */
    public function removeDatum(\System\TrackerBundle\Entity\Data $data)
    {
        $this->data->removeElement($data);
    }

    /**
     * Get data
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getData()
    {
        return $this->data;
    }
}
