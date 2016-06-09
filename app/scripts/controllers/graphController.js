'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('GraphCtrl', function ($scope, $resource) {

      // // Read the complete graph from api
      $scope.complete = [];
      var Complete = $resource('http://localhost:5000/draw/6c4ede4f-04a3-4472-80b1-9c9700106b9f/FM%5E3%20(OGDF)');
      var complete = Complete.query();
      complete.$promise.then(function (result) {
          $scope.complete = result.pop();
          console.log("done");
      });

});