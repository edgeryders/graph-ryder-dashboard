'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource) {
        
        $scope.apiUrl = "http://nferon.ovh:5000/"
        var layout = "FM^3 (OGDF)";

        $scope.userel  = true;
        $scope.postel = false;

        $scope.usersGraphSigma = [];
        var field = "uid";
        var value = "34";

        // todo call users route
        var CreateGraph = $resource($scope.apiUrl + 'users/doi/'+ field +'/'+ value);
        var creategraph = CreateGraph.query();
        creategraph.$promise.then(function (result) {
            var graph_id = result.pop();
            var graph_id_string = ""
            angular.forEach(graph_id, function(value, key) {
                graph_id_string += value;
            });
            var drawGraph = $resource($scope.apiUrl + 'draw/'+ graph_id_string +'/'+ layout);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.usersGraphSigma = result.pop();
            });
        });

        $scope.postsGraphSigma = [];
        var params = {"uid": [34, 32]};

        // todo call posts routeA
        var CreateGraph = $resource($scope.apiUrl + 'createGraph', params);
        var creategraph = CreateGraph.query();
        creategraph.$promise.then(function (result) {
            var graph_id = result.pop();
            var graph_id_string = ""
            angular.forEach(graph_id, function(value, key) {
                graph_id_string += value;
            });
            var drawGraph = $resource($scope.apiUrl + 'draw/'+ graph_id_string +'/'+ layout);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.postsGraphSigma = result.pop();
            });
        });
    });
