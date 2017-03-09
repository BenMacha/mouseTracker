# MouseTrackerBundle (mouseflow)#
### By D'Ali Ben Macha <contact@benmacha.tn> [https://dali.benmacha.tn](https://dali.benmacha.tn) ###


[![Latest Stable Version](https://poser.pugx.org/benmacha/mousetracker/version)](https://packagist.org/packages/benmacha/mousetracker) [![Total Downloads](https://poser.pugx.org/benmacha/mousetracker/downloads)](https://packagist.org/packages/benmacha/mousetracker) [![Latest Unstable Version](https://poser.pugx.org/benmacha/mousetracker/v/unstable)](//packagist.org/packages/benmacha/mousetracker) [![License](https://poser.pugx.org/benmacha/mousetracker/license)](https://packagist.org/packages/benmacha/mousetracker) 

## Installation ##

Add the `benmacha/mousetracker` package to your `require` section in the `composer.json` file.

``` bash
$ composer require benmacha/mousetracker dev-master
```

Add the MouseTrackerBundle to your application's kernel:

``` php
<?php
public function registerBundles()
{
    $bundles = array(
        // ...
        new benmacha\mousetracker\TrackerBundle(),
        // ...
    );
    ...
}
```

Configure the `Tracker` in your `routing.yml`:

``` yaml
mouse_tracker:
    resource: "@TrackerBundle/Controller/"
    type:     annotation
    prefix:   /tracker
```

Create Table:

``` bash
$   php app/console doctrine:schema:update --force
```


## Usage ##

Configure the `Tracker` client(s) in your `config.yml`:

_test test._

``` yaml
ddd:
    clients:
        default:
            aaaa: dddd
```