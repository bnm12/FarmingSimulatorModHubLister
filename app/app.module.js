'use strict';

var app = angular.module('FarmingSimApp', [
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

  app.controller('BaseController', ['$scope', function($scope) {
    var vm = this;
    var urlParams = new URLSearchParams(window.location.search);

    vm.selectedVersion = urlParams.get('version');;

    vm.selectVersion = function(version) {
      vm.selectedVersion = version;
      history.pushState({version: version}, version, window.location.href + "?version=" + version);
    }
  }])