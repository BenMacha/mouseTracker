<?php

namespace benmacha\mousetracker;

use benmacha\mousetracker\DependencyInjection\MouseTrackerExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class TrackerBundle extends Bundle
{
    public function getContainerExtension()
    {
      return new MouseTrackerExtension();
    }
}
