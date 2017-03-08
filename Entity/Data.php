<?php

namespace benmacha\mousetracker\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Data
 *
 * @ORM\Table(name="tracker__data")
 * @ORM\Entity(repositoryClass="\benmacha\mousetracker\TrackerBundle\Repository\DataRepository")
 */
class Data
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
     * @var array
     *
     * @ORM\Column(name="movements", type="text", nullable=true)
     */
    private $movements;

    /**
     * @var array
     *
     * @ORM\Column(name="clicks", type="text", nullable=true)
     */
    private $clicks;

    /**
     * @var array
     *
     * @ORM\Column(name="partial", type="text", nullable=true)
     */
    private $partial;

    /**
     * @var string
     *
     * @ORM\Column(name="w", type="string", length=25, nullable=true)
     */
    private $w;

    /**
     * @var array
     *
     * @ORM\Column(name="cachedRecords", type="text", nullable=true)
     */
    private $cachedRecords;

    /**
     * @var string
     *
     * @ORM\Column(name="record", type="string", length=25, nullable=true)
     */
    private $record;

    /**
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="data")
     * @ORM\JoinColumn(name="clientPageID", referencedColumnName="id", onDelete="CASCADE",)
     */
    private $clientPageID;

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
     * Set movements
     *
     * @param string $movements
     * @return Data
     */
    public function setMovements($movements)
    {
        $this->movements = $movements;

        return $this;
    }

    /**
     * Get movements
     *
     * @return string 
     */
    public function getMovements()
    {
        return $this->movements;
    }

    /**
     * Set clicks
     *
     * @param string $clicks
     * @return Data
     */
    public function setClicks($clicks)
    {
        $this->clicks = $clicks;

        return $this;
    }

    /**
     * Get clicks
     *
     * @return string 
     */
    public function getClicks()
    {
        return $this->clicks;
    }

    /**
     * Set partial
     *
     * @param string $partial
     * @return Data
     */
    public function setPartial($partial)
    {
        $this->partial = $partial;

        return $this;
    }

    /**
     * Get partial
     *
     * @return string 
     */
    public function getPartial()
    {
        return $this->partial;
    }

    /**
     * Set w
     *
     * @param string $w
     * @return Data
     */
    public function setW($w)
    {
        $this->w = $w;

        return $this;
    }

    /**
     * Get w
     *
     * @return string 
     */
    public function getW()
    {
        return $this->w;
    }

    /**
     * Set cachedRecords
     *
     * @param string $cachedRecords
     * @return Data
     */
    public function setCachedRecords($cachedRecords)
    {
        $this->cachedRecords = $cachedRecords;

        return $this;
    }

    /**
     * Get cachedRecords
     *
     * @return string 
     */
    public function getCachedRecords()
    {
        return $this->cachedRecords;
    }

    /**
     * Set record
     *
     * @param string $record
     * @return Data
     */
    public function setRecord($record)
    {
        $this->record = $record;

        return $this;
    }

    /**
     * Get record
     *
     * @return string 
     */
    public function getRecord()
    {
        return $this->record;
    }

    /**
     * Set date
     *
     * @param \DateTime $date
     * @return Data
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
     * Set clientPageID
     *
     * @param \System\TrackerBundle\Entity\Page $clientPageID
     * @return Data
     */
    public function setClientPageID(\System\TrackerBundle\Entity\Page $clientPageID = null)
    {
        $this->clientPageID = $clientPageID;

        return $this;
    }

    /**
     * Get clientPageID
     *
     * @return \System\TrackerBundle\Entity\Page 
     */
    public function getClientPageID()
    {
        return $this->clientPageID;
    }
}
