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

      $scope.graphSigma = [];
      $scope.field = "uid";
      $scope.value = "32";

      $scope.submit = function () {
          // // Read the complete graph from api
          var CreateGraph = $resource('http://localhost:5000/createGraph/'+ $scope.field +'/'+ $scope.value);
          var creategraph = CreateGraph.query();
          creategraph.$promise.then(function (result) {
              var graph_id = result.pop();
              var graph_id_string = ""
              angular.forEach(graph_id, function(value, key) {
                  graph_id_string += value;
              });
              console.log(graph_id_string);
              var drawGraph = $resource('http://localhost:5000/draw/'+ graph_id_string +'/FM%5E3%20(OGDF)');
              var drawgraph = drawGraph.query();
              drawgraph.$promise.then(function (result) {
                  $scope.graphSigma = result.pop();
                  console.log("done");
              });
          });
          

      };


});