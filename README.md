# MouseTracker (mouseflow)#
### By D'Ali Ben Macha <contact@benmacha.tn> [https://dali.benmacha.tn](https://dali.benmacha.tn) ###
## Installation ##

Add the `benmacha/mousetracker` package to your `require` section in the `composer.json` file.

``` bash
$ composer require benmacha/mousetracker dev-master
```

Add the RedisBundle to your application's kernel:

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