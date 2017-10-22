'use strict';

angular.module('FarmingSimApp', [
  'ngAnimate',
  'ngSanitize',
  'angularUtils.directives.dirPagination'
]).config(['$locationProvider', function AppConfig($locationProvider) {
  
      // enable html5Mode for pushstate ('#'-less URLs)
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
      $locationProvider.hashPrefix('!');
  
  }]);
