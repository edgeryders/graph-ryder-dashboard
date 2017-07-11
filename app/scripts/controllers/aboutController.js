/**
 * Created by nferon on 01/07/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('AboutCtrl', function ($scope, $rootScope, $resource, config, $q) {
      $rootScope.resetSuggestions(false, false, false, false);
});
