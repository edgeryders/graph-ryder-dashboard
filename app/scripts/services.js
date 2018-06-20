'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Global services of the application.
 */

angular.module('sbAdminApp', [])
  .factory('resizeBroadcast', function() {
    var resizeBroadcast = function() {
      var timesRun = 0;
      var interval = setInterval(function(){
        timesRun += 1;
        if(timesRun === 5){
          clearInterval(interval);
        }
        window.dispatchEvent(new Event('resize'));
      }, 62.5);
    };
    return resizeBroadcast;
  });